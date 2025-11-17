import { default as SqliteDatabase } from 'better-sqlite3';
import type { Database } from 'better-sqlite3';
import type { Note, NoteStatus, Task } from './model.js';
import {
  InvalidNoteIdError,
  type NoteObserver,
  type Storage
} from './storage.js';

export class SqliteStorage implements Storage {
  db: Database;
  _obsIdCounter: number = 0;
  onNoteCreateObservers: { [key: number]: NoteObserver } = {};
  onNoteUpdateObservers: { [key: number]: NoteObserver } = {};
  onNoteDeleteObservers: { [key: number]: NoteObserver } = {};

  /** If dbPath is not provided (e.g for unit testing), use in memory db instead */
  constructor(opts?: { dbPath?: string }) {
    const dbOpts = { verbose: console.log };
    const dbPath = opts?.dbPath ? opts.dbPath : ':memory:';

    this.db = new SqliteDatabase(dbPath, dbOpts);

    console.log(`Connected to the SQLite database: ${dbPath}`);

    console.log('Creating tables');
    /* Sqlite won't recreate tables nor erase them if they already exist */
    this.createTables();
  }

  getNotes(): Array<Note> {
    return this.db.prepare('SELECT * FROM notes').all() as Array<Note>;
  }

  getNote(id: number): Note | null {
    return this.db
      .prepare('SELECT * FROM notes WHERE id = ?')
      .get(id) as Note | null;
  }

  deleteNote(id: number): Note | null {
    const note = this.getNote(id);
    if (!note) return null;

    const runResult = this.db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    if (runResult.changes === 0) {
      throw new Error(
        `Couldn't delete note with id ${id} although it exists in the database`
      );
    } else {
      Object.values(this.onNoteDeleteObservers).forEach(obs => obs(note));
      return note;
    }
  }

  createNote(params: { title: string; status: NoteStatus }): Note {
    const { title, status } = params;

    const runResult = this.db
      .prepare('INSERT INTO notes (title, status) VALUES (?, ?)')
      .run(title, status);
    const note = {
      id: Number(runResult.lastInsertRowid),
      title,
      status,
      tasks: []
    };
    Object.values(this.onNoteCreateObservers).forEach(obs => obs(note));
    return note;
  }

  getNoteTasks(noteId: number): Array<Task> {
    const note = this.getNote(noteId);
    if (!note) throw new InvalidNoteIdError();

    return this.db
      .prepare('SELECT * FROM tasks WHERE noteId = ?')
      .all(noteId) as Array<Task>;
  }

  createTask(params: { noteId: number; content: string }): Task {
    const { noteId, content } = params;

    const note = this.getNote(noteId);
    if (!note) throw new InvalidNoteIdError();

    const runResult = this.db
      .prepare('INSERT INTO tasks (content, noteId) VALUES (?, ?)')
      .run(content, noteId);
    debugger;
    Object.values(this.onNoteUpdateObservers).forEach(obs => obs(note));
    return { id: Number(runResult.lastInsertRowid), content };
  }

  deleteTask(taskId: number): boolean {
    const res = this.db
      .prepare('SELECT noteId FROM tasks WHERE id = ?')
      .get(taskId) as { noteId: number } | null;
    if (!res) return false; /* No task with that id */

    const note = this.getNote(res.noteId);
    if (!note)
      throw new Error(
        `Couldn't find a note with id ${res.noteId} even though task ${taskId} as it as foreign key`
      );

    const runResult = this.db
      .prepare('DELETE FROM tasks WHERE id = ?')
      .run(taskId);
    if (runResult.changes === 0) {
      throw new Error(
        `Couldn't delete task with id ${taskId} although it exists in the database`
      );
    } else {
      Object.values(this.onNoteUpdateObservers).forEach(obs => obs(note));
      return true;
    }
  }

  onNoteUpdate(obs: NoteObserver): number {
    debugger;
    let id = this._obsIdCounter++;
    this.onNoteUpdateObservers[id] = obs;
    return id;
  }
  onNoteCreate(obs: NoteObserver): number {
    let id = this._obsIdCounter++;
    this.onNoteCreateObservers[id] = obs;
    return id;
  }
  onNoteDelete(obs: NoteObserver): number {
    let id = this._obsIdCounter++;
    this.onNoteDeleteObservers[id] = obs;
    return id;
  }

  removeObserver(obsId: number): void {
    debugger;
    let obsMaps = [
      this.onNoteUpdateObservers,
      this.onNoteCreateObservers,
      this.onNoteDeleteObservers
    ];
    obsMaps.forEach(obsMap => delete obsMap[obsId]);
  }

  createTables(): void {
    createTables(this.db)
  }

  deleteTables(): void {
    deleteTables(this.db)
  }
}

/** Util functions */
export function createTables(db: Database): Database {
  db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT
  )
  `);
  console.log('Notes table created.');

  // Create the `tasks` table with foreign key to `notes`
  db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    noteId INTEGER,
    FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE
  )
  `);
  console.log('Tasks table created.');
  return db;
}


export function deleteTables(db: Database) {
  db.prepare('DELETE FROM tasks;').run();
  db.prepare('DELETE FROM notes;').run();
}
