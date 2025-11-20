import { default as SqliteDatabase } from 'better-sqlite3';
import type { Database } from 'better-sqlite3';
import typia from 'typia';
import type { Note, NoteStatus, NoteWithTasks } from './model.js';
import {
  InvalidNoteIdError,
  type NoteObserver,
  type Storage,
  type TaskWithNoteId
} from './storage.js';

type NoteWithIsDeleted = Note & { isDeleted: number };

export class SqliteStorage implements Storage {
  db: Database;
  _obsIdCounter: number = 0;
  onNoteCreateObservers: { [key: number]: NoteObserver } = {};
  onNoteUpdateObservers: { [key: number]: NoteObserver } = {};
  onNoteDeleteObservers: { [key: number]: NoteObserver } = {};

  /** If dbPath is not provided (e.g for unit testing), use in memory db instead */
  constructor(opts?: { dbPath?: string }) {
    //const dbOpts = { verbose: console.log };
    const dbOpts = {};
    const dbPath = opts?.dbPath ? opts.dbPath : ':memory:';

    this.db = new SqliteDatabase(dbPath, dbOpts);

    console.log(`Connected to the SQLite database: ${dbPath}`);

    console.log('Creating tables');
    /* Sqlite won't recreate tables nor erase them if they already exist */
    this.createTables();
  }

  getNotes(): Array<Note> {
    const arrayRes = this.db
      .prepare('SELECT id, title, status FROM notes WHERE isDeleted = 0')
      .all();
    return typia.assertEquals<Array<Note>>(arrayRes);
  }

  getNote(id: number): Note | undefined {
    const res = this.db
      .prepare('SELECT id, title, status FROM notes WHERE id = ? AND isDeleted = 0')
      .get(id);
    return typia.assertEquals<Note | undefined>(res);
  }

  getNoteWithTasks(id: number): NoteWithTasks | undefined {
    const note = this.getNote(id);
    if (note === undefined) return;

    /* get tasks */
    return {
      ...note,
      tasks: this.getNoteTasks(id).map(t => ({ id: t.id, content: t.content }))
    };
  }

  deleteNote(id: number): Note | undefined {
    const note = this.getNoteWithTasks(id);
    if (!note) return undefined;

    const runResult = this.db
      .prepare('UPDATE notes SET isDeleted = 1 WHERE id = ?')
      .run(id);
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

    const note = this.getNoteWithTasks(runResult.lastInsertRowid as number);

    if (note === undefined)
      throw new Error(
        'Should have gotten a note with that ID, unexpected DB error'
      );

    Object.values(this.onNoteCreateObservers).forEach(obs => obs(note));
    return {id: note.id, title: note.title, status: note.status};
  }

  getNoteTasks(noteId: number): Array<TaskWithNoteId> {
    const note = this.getNote(noteId);
    if (!note) throw new InvalidNoteIdError();

    const result = this.db
      .prepare(
        `SELECT tasks.id, content, noteId FROM tasks 
             LEFT JOIN notes ON notes.id = tasks.noteId 
             WHERE notes.id = ? AND isDeleted = 0`
      )
      .all(noteId);

    return typia.assertEquals<Array<TaskWithNoteId>>(result);
  }

  restoreNote(id: number): NoteWithTasks | undefined {
    const res = this.db
      .prepare('SELECT id, title, status, isDeleted FROM notes WHERE id = ?')
      .get(id);
    const note = typia.assertEquals<NoteWithIsDeleted | undefined>(res);
    if (note === undefined) return;

    if (note.isDeleted === 1) {
      /* Note exist AND was marked as deleted, update and notify observers */
      this.db.prepare('UPDATE notes SET isDeleted = 0 WHERE id = ?').run(id);
      const noteWithTasks = this.getNoteWithTasks(id);
      if (noteWithTasks === undefined) throw new Error("Note with this ID should exist, unexpected DB error");
      Object.values(this.onNoteCreateObservers).forEach(o => o(noteWithTasks));
      return noteWithTasks;
    } else {
      /* 
       * Can't factorize this getter, because if 'isDeleted=0', you will get nothing
       * from getNoteWithTask(id), so we need to first update isDeleted in the other handle
       */
      return this.getNoteWithTasks(id);
    }
  }

  createTask(params: { noteId: number; content: string }): TaskWithNoteId {
    const { noteId, content } = params;

    const note = this.getNote(noteId);
    if (!note) throw new InvalidNoteIdError();

    const runResult = this.db
      .prepare('INSERT INTO tasks (content, noteId) VALUES (?, ?)')
      .run(content, noteId);

    if (runResult.changes !== 1) {
      throw new Error(
        'Unexpected error on INSERT INTO tasks. No new row created'
      );
    }

    const updatedNote = this.getNoteWithTasks(noteId);
    if (updatedNote === undefined) {
      throw new Error('A note with this ID should exist, unexpected DB error');
    }
    Object.values(this.onNoteUpdateObservers).forEach(obs => obs(updatedNote));

    const newTaskId = runResult.lastInsertRowid as number;
    return typia.assertEquals<TaskWithNoteId>(this.getTask(newTaskId));
  }

  getTask(id: number): TaskWithNoteId | undefined {
    return typia.assertEquals<TaskWithNoteId | undefined>(
      this.db.prepare('SELECT id, content, noteId FROM tasks WHERE id = ?').get(id)
    );
  }

  /** 
   * FIXME: deleting a task attached to a note with "isDeleted:1" will give an unappropriate error
   */
  deleteTask(taskId: number): boolean {
    const res = typia.assertEquals<{ noteId: number } | undefined>(
      this.db.prepare('SELECT noteId FROM tasks WHERE id = ?').get(taskId)
    );

    if (!res) return false; /* No task with that id */

    const noteId = res.noteId;
    const note = this.getNote(noteId);
    if (!note) {
      throw new Error(
        `Couldn't find a note with id ${res.noteId} even though task ${taskId} as it as foreign key`
      );
    }

    const runResult = this.db
      .prepare('DELETE FROM tasks WHERE id = ?')
      .run(taskId);

    if (runResult.changes === 0) {
      throw new Error(
        `Couldn't delete task with id ${taskId} although it exists in the database`
      );
    }

    const updatedNote = this.getNoteWithTasks(noteId);
    if (updatedNote === undefined) {
      throw new Error('A note with this ID should exist, unexpected DB error');
    }

    Object.values(this.onNoteUpdateObservers).forEach(obs => obs(updatedNote));
    return true;
  }

  onNoteUpdate(obs: NoteObserver): number {
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
    let obsMaps = [
      this.onNoteUpdateObservers,
      this.onNoteCreateObservers,
      this.onNoteDeleteObservers
    ];
    obsMaps.forEach(obsMap => delete obsMap[obsId]);
  }

  createTables(): void {
    createTables(this.db);
  }

  deleteTables(): void {
    deleteTables(this.db);
  }
}

/** Util functions */
export function createTables(db: Database): Database {
  db.exec(`
          CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            status TEXT,
            isDeleted INTEGER DEFAULT 0
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
