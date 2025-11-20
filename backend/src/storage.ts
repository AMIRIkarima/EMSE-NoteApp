import type { Note, Task, NoteStatus, NoteWithTasks } from './model.js';

export type NoteObserver = (note: NoteWithTasks) => void;
export type TaskWithNoteId = Task & { noteId: number };

/**
 * Storage must implement a observer pattern
 */
export type Storage = {
  getNotes(): Array<Note>;
  getNote(id: number): Note | undefined;

  /**
   * Returns the note object is succesfully deleted.
   * Returns undefined if the object doesn't exist
   * Throws error if the object exists but there is an unexpected error on delete
   *
   * Triggers onNoteDelete()
   */
  deleteNote(id: number): Note | undefined;

  /**
   * Triggers onNoteCreate()
   */
  createNote(params: { title: string; status: NoteStatus }): Note;

  /** May throw InvalidNoteIdError */
  getNoteTasks(noteId: number): Array<TaskWithNoteId>;

  /**
   * Returns undefined if the note doesn't exist. If not ID refers to an existing, non deleted note, that is returned
   * even though no action was done.
   *
   * Succesfully restoring a note will trigger "onNoteCreate" if the note was in fact deleted. It will return nothing
   * if the note existed and was not deleted (so not restored)
   */
  restoreNote(noteId: number): NoteWithTasks | undefined;

  /**
   * May throw InvalidNoteIdError
   *
   * Triggers onNoteUpdate()
   */
  createTask(params: { noteId: number; content: string }): TaskWithNoteId;

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
