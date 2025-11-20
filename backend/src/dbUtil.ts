import { default as fs } from 'fs';
import { default as SqliteDatabase } from 'better-sqlite3';
import type { Database } from 'better-sqlite3';

export function deleteAndRecreateFileDatabase(dbPath: string): Database {
  // Delete the existing database file if it exists
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log(`Existing database file ${dbPath} deleted.`);
  }

  const db = new SqliteDatabase(dbPath, { verbose: console.log });
  console.log('New database created in place');
  return db;
}

export function populateDatase(db: Database) {
  // Insert sample data into 'notes' table
  db.exec(`
      INSERT INTO notes (title, status) VALUES 
      ('Note 1', 'urgent'),
      ('Note 2', 'serious'),
      ('Note 3', 'unimportant')
    `);

  // Insert sample data into 'tasks' table
  db.exec(`
      INSERT INTO tasks (content, noteId) VALUES 
      ('Task 1 for Note 1', 1),
      ('Task 2 for Note 1', 1),
      ('Task 1 for Note 2', 2)
    `);
}
