import { it, beforeAll, describe, beforeEach, vi, expect } from 'vitest';
import { SqliteStorage } from '../sqliteStorage.js';
import type { Note } from '../model.js';

let db: SqliteStorage;

beforeAll(() => {
  db = new SqliteStorage();
});

describe('restoreNote()', () => {
  let note1: Note;
  beforeEach(() => {
    note1 = db.createNote({ title: 'Note 1', status: 'serious' });
  });

  it('call onNoteCreate listeners when a note is succesfully restored', () => {
    db.deleteNote(note1.id);
    const onCreateListener = vi.fn();
    db.onNoteCreate(onCreateListener);
    let restoredNote1 = db.restoreNote(note1.id);
    expect(restoredNote1).toMatchObject(note1);
    expect(onCreateListener).toHaveBeenCalled();
  });

  it("doesn't call onNoteCreate listeners when an called on a non deleted note", () => {
    const onCreateListener = vi.fn();
    db.onNoteCreate(onCreateListener);
    let restoredNote1 = db.restoreNote(note1.id);
    expect(restoredNote1).toMatchObject(note1);
    expect(onCreateListener).not.toHaveBeenCalled();
  });
});
