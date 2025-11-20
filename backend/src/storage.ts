import type { Note, Task, NoteStatus } from './model.js';

export type NoteObserver = (note: Note) => void;

/**
 * Storage must implement a observer pattern
 */
export type Storage = {
  getNotes(): Array<Note>;
  getNote(id: number): Note | null;

  /**
   * Returns the note object is succesfully deleted.
   * Returns null if the object doesn't exist
   * Throws error if the object exists but there is an unexpected error on delete
   *
   * Triggers onNoteDelete()
   */
  deleteNote(id: number): Note | null;

  /**
   * Triggers onNoteCreate()
   */
  createNote(params: { title: string; status: NoteStatus }): Note;

  /** May throw InvalidNoteIdError */
  getNoteTasks(noteId: number): Array<Task>;

  /**
   * May throw InvalidNoteIdError
   *
   * Triggers onNoteUpdate()
   */
  createTask(params: { noteId: number; content: string }): Task;

  /**
   * Return false if the task with given ID does not exist. Throw error if unexpected error on delete
   * returns true otherwise
   *
   * Triggers onNoteUpdate()
   */
  deleteTask(taskId: number): boolean;

  /**
   * Each observer registering method returns an ID to use for removing the observer
   */

  /** Observers called when tasks are added to a note */
  onNoteUpdate(cb: NoteObserver): number;

  /** Observers called when a note is created */
  onNoteCreate(cb: NoteObserver): number;

  /** Observers called when a note is deleted */
  onNoteDelete(cb: NoteObserver): number;

  /** ObsevrerId: the number that was returned on obserevr registration */
  removeObserver(observerId: number): void;
};

export class InvalidNoteIdError extends Error {}
