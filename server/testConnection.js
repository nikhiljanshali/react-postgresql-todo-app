import pg from 'pg';
const { Client } = pg;

async function checkAndCreateDb() {
  const connectionString = 'postgresql://postgres:Shreehari%23%244698@localhost:5432/postgres';
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('🔌 Connected to PostgreSQL (postgres database)');
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'todo_db'");
    if (res.rows.length === 0) {
      console.log('Creating database "todo_db"...');
      await client.query('CREATE DATABASE todo_db');
      console.log('✅ Database "todo_db" created successfully!');
    } else {
      console.log('✅ Database "todo_db" already exists.');
    }
    await client.end();
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

checkAndCreateDb();
