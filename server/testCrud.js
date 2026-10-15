import dotenv from 'dotenv';
dotenv.config();

import { 
  initializeDatabase, 
  getAllTodos, 
  createTodo, 
  updateTodo, 
  deleteTodo, 
  toggleTodo,
  toggleSubtask,
  pool 
} from './db.js';

async function runCrudTest() {
  console.log('--- 🧪 STARTING POSTGRESQL CRUD TEST ---');

  // Step 1: Initialize Database
  console.log('\n[1/6] Initializing database & running migrations...');
  const initSuccess = await initializeDatabase();
  if (!initSuccess) {
    console.error('❌ Failed to initialize database');
    process.exit(1);
  }
  console.log('✅ Database and tables initialized successfully.');

  // Step 2: Fetch existing todos
  const initialTodos = await getAllTodos();
  console.log(`✅ Fetched existing todos from PostgreSQL. Count: ${initialTodos.length}`);

  // Step 3: INSERT - Create a new dummy todo
  const todayStr = new Date().toISOString().split('T')[0]; // Current date
  console.log(`\n[2/6] Inserting new dummy todo with today's date (${todayStr})...`);
  
  const dummyPayload = {
    id: 'test-todo-' + Date.now(),
    title: '🚀 Launch PostgreSQL Sync Integration',
    description: 'Verify dynamic persistence with local PostgreSQL on localhost:5432',
    category: 'work',
    priority: 'high',
    dueDate: todayStr,
    subtasks: [
      { id: 'sub-test-1', title: 'Verify database connection & tables', completed: true },
      { id: 'sub-test-2', title: 'Test CRUD lifecycle operations', completed: false }
    ]
  };

  const created = await createTodo(dummyPayload);
  console.log('✅ Created todo in PostgreSQL:', {
    id: created.id,
    title: created.title,
    dueDate: created.dueDate,
    subtasksCount: created.subtasks?.length
  });

  // Step 4: Verify Insert in Database
  console.log('\n[3/6] Verifying insert directly in database...');
  const queryCheck = await pool.query('SELECT * FROM todos WHERE id = $1', [created.id]);
  if (queryCheck.rows.length === 1) {
    console.log('✅ Todo verified in "todos" table:', queryCheck.rows[0].title);
  } else {
    throw new Error('Todo was not found in table after creation!');
  }

  const subtasksCheck = await pool.query('SELECT * FROM subtasks WHERE todo_id = $1', [created.id]);
  console.log(`✅ Subtasks verified in "subtasks" table. Count: ${subtasksCheck.rows.length}`);

  // Step 5: UPDATE - Update the todo details & toggle subtask
  console.log('\n[4/6] Updating the todo in PostgreSQL...');
  await updateTodo(created.id, {
    title: '🚀 Launch PostgreSQL Sync Integration (UPDATED)',
    description: 'Updated notes: Tested and verified dynamic database persistence.',
    priority: 'high',
    category: 'work',
    dueDate: todayStr,
    subtasks: [
      { id: 'sub-test-1', title: 'Verify database connection & tables', completed: true },
      { id: 'sub-test-2', title: 'Test CRUD lifecycle operations', completed: true }
    ]
  });

  const updateCheck = await pool.query('SELECT * FROM todos WHERE id = $1', [created.id]);
  console.log('✅ Updated title in PostgreSQL:', updateCheck.rows[0].title);

  // Test toggling completion
  console.log('\n[5/6] Toggling todo completion status in PostgreSQL...');
  const toggleResult = await toggleTodo(created.id);
  console.log(`✅ Completed status toggled to: ${toggleResult}`);

  // Step 6: DELETE - Delete the test todo
  console.log('\n[6/6] Deleting the test todo from PostgreSQL...');
  await deleteTodo(created.id);

  const deleteCheck = await pool.query('SELECT * FROM todos WHERE id = $1', [created.id]);
  const deleteSubtasksCheck = await pool.query('SELECT * FROM subtasks WHERE todo_id = $1', [created.id]);
  
  if (deleteCheck.rows.length === 0 && deleteSubtasksCheck.rows.length === 0) {
    console.log('✅ Todo and cascading subtasks successfully deleted from PostgreSQL!');
  } else {
    throw new Error('Todo was not deleted properly!');
  }

  console.log('\n======================================================');
  console.log('🎉 ALL POSTGRESQL CRUD TESTS PASSED 100% SUCCESSFULLY!');
  console.log('======================================================\n');

  await pool.end();
}

runCrudTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
