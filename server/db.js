import pg from 'pg';
import dotenv from 'dotenv';
import { INITIAL_MOCK_TODOS } from './seedData.js';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/todo_db';

// Configure pool with SSL handling for cloud hosts (Neon, Supabase, RDS, etc.)
const isRemoteHost = connectionString.includes('neon.tech') || 
                     connectionString.includes('supabase.co') || 
                     connectionString.includes('render.com') ||
                     connectionString.includes('sslmode=require');

export const pool = new Pool({
  connectionString,
  ssl: isRemoteHost ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
});

export let isDbConnected = false;
export let dbError = null;

// Ensure target database exists; if not, create it via default postgres db
async function ensureDatabaseExists() {
  try {
    const url = new URL(connectionString);
    const targetDb = url.pathname.replace(/^\//, '');
    if (targetDb && targetDb !== 'postgres') {
      const maintenanceUrl = new URL(connectionString);
      maintenanceUrl.pathname = '/postgres';
      const mPool = new Pool({
        connectionString: maintenanceUrl.toString(),
        ssl: isRemoteHost ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 5000,
      });
      const mClient = await mPool.connect();
      const checkRes = await mClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [targetDb]);
      if (checkRes.rows.length === 0) {
        console.log(`📦 Creating PostgreSQL database "${targetDb}"...`);
        await mClient.query(`CREATE DATABASE "${targetDb}"`);
        console.log(`✅ Database "${targetDb}" created.`);
      }
      mClient.release();
      await mPool.end().catch(() => {});
    }
  } catch (err) {
    // Proceed to pool connection attempt
  }
}

// Initialize tables and seed initial mock data
export async function initializeDatabase() {
  try {
    await ensureDatabaseExists();
    const client = await pool.connect();
    isDbConnected = true;
    dbError = null;
    console.log('✅ Connected to PostgreSQL database successfully.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) DEFAULT 'work',
        priority VARCHAR(20) DEFAULT 'medium',
        due_date DATE,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS subtasks (
        id VARCHAR(100) PRIMARY KEY,
        todo_id VARCHAR(100) REFERENCES todos(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        position INT DEFAULT 0
      );
    `);

    // Check if table has data; if empty, seed with initial mock data
    const countRes = await client.query('SELECT COUNT(*) FROM todos');
    const count = parseInt(countRes.rows[0].count, 10);
    if (count === 0) {
      console.log('🌱 Seeding PostgreSQL database with initial mockup tasks...');
      await seedDatabaseInternal(client);
      console.log('✨ Seed completed.');
    }

    client.release();
    return true;
  } catch (err) {
    isDbConnected = false;
    dbError = err.message;
    console.warn('⚠️ PostgreSQL connection failed:', err.message);
    console.warn('💡 Please configure DATABASE_URL in your .env file.');
    return false;
  }
}

async function seedDatabaseInternal(client) {
  for (let i = 0; i < INITIAL_MOCK_TODOS.length; i++) {
    const todo = INITIAL_MOCK_TODOS[i];
    await client.query(
      `INSERT INTO todos (id, title, description, category, priority, due_date, completed, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        todo.id,
        todo.title,
        todo.description || '',
        todo.category || 'work',
        todo.priority || 'medium',
        todo.dueDate || null,
        todo.completed || false,
        todo.createdAt || new Date().toISOString()
      ]
    );

    if (Array.isArray(todo.subtasks)) {
      for (let s = 0; s < todo.subtasks.length; s++) {
        const sub = todo.subtasks[s];
        await client.query(
          `INSERT INTO subtasks (id, todo_id, title, completed, position)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO NOTHING`,
          [sub.id, todo.id, sub.title, sub.completed || false, s]
        );
      }
    }
  }
}

// Queries
export async function getAllTodos() {
  const query = `
    SELECT 
      t.id, 
      t.title, 
      t.description, 
      t.category, 
      t.priority, 
      TO_CHAR(t.due_date, 'YYYY-MM-DD') AS "dueDate", 
      t.completed, 
      t.created_at AS "createdAt",
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('id', s.id, 'title', s.title, 'completed', s.completed)
          ORDER BY s.position ASC
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
      ) AS subtasks
    FROM todos t
    LEFT JOIN subtasks s ON t.id = s.todo_id
    GROUP BY t.id
    ORDER BY t.created_at DESC;
  `;
  const res = await pool.query(query);
  return res.rows;
}

export async function createTodo(data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const id = data.id || 'todo-' + Date.now();
    const createdAt = data.createdAt || new Date().toISOString();

    await client.query(
      `INSERT INTO todos (id, title, description, category, priority, due_date, completed, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        data.title,
        data.description || '',
        data.category || 'work',
        data.priority || 'medium',
        data.dueDate || null,
        false,
        createdAt
      ]
    );

    const subtasks = Array.isArray(data.subtasks) ? data.subtasks : [];
    for (let i = 0; i < subtasks.length; i++) {
      const sub = subtasks[i];
      const subId = sub.id || `sub-${Date.now()}-${i}`;
      await client.query(
        `INSERT INTO subtasks (id, todo_id, title, completed, position)
         VALUES ($1, $2, $3, $4, $5)`,
        [subId, id, sub.title, !!sub.completed, i]
      );
    }

    await client.query('COMMIT');
    return { id, ...data, subtasks, completed: false, createdAt };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateTodo(id, data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE todos 
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           category = COALESCE($4, category),
           priority = COALESCE($5, priority),
           due_date = COALESCE($6, due_date),
           completed = COALESCE($7, completed)
       WHERE id = $1`,
      [
        id,
        data.title,
        data.description,
        data.category,
        data.priority,
        data.dueDate,
        typeof data.completed === 'boolean' ? data.completed : null
      ]
    );

    // If subtasks are provided, replace them
    if (Array.isArray(data.subtasks)) {
      await client.query('DELETE FROM subtasks WHERE todo_id = $1', [id]);
      for (let i = 0; i < data.subtasks.length; i++) {
        const sub = data.subtasks[i];
        const subId = sub.id || `sub-${Date.now()}-${i}`;
        await client.query(
          `INSERT INTO subtasks (id, todo_id, title, completed, position)
           VALUES ($1, $2, $3, $4, $5)`,
          [subId, id, sub.title, !!sub.completed, i]
        );
      }
    }

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteTodo(id) {
  await pool.query('DELETE FROM todos WHERE id = $1', [id]);
  return true;
}

export async function toggleTodo(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT completed FROM todos WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      throw new Error('Todo not found');
    }
    const nextCompleted = !current.rows[0].completed;

    await client.query('UPDATE todos SET completed = $2 WHERE id = $1', [id, nextCompleted]);

    if (nextCompleted) {
      await client.query('UPDATE subtasks SET completed = TRUE WHERE todo_id = $1', [id]);
    }

    await client.query('COMMIT');
    return nextCompleted;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function toggleSubtask(todoId, subtaskId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(
      'UPDATE subtasks SET completed = NOT completed WHERE id = $1 AND todo_id = $2',
      [subtaskId, todoId]
    );

    // Check if all subtasks completed
    const subtaskRes = await client.query(
      'SELECT completed FROM subtasks WHERE todo_id = $1',
      [todoId]
    );
    const allDone = subtaskRes.rows.length > 0 && subtaskRes.rows.every(r => r.completed);
    if (allDone) {
      await client.query('UPDATE todos SET completed = TRUE WHERE id = $1', [todoId]);
    }

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function clearCompleted() {
  await pool.query('DELETE FROM todos WHERE completed = TRUE');
  return true;
}

export async function resetDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM subtasks');
    await client.query('DELETE FROM todos');
    await seedDatabaseInternal(client);
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
