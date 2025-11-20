import type { Express, Response } from 'express';
import { InvalidNoteIdError, type Storage } from './storage.js';
import packageJson from '../package.json' with { type: 'json' };

export function setup(app: Express, storage: Storage) {
  // Get API version
  app.get('/version', async (req, res) => {
    res.json({
      version: packageJson.version,
      platform: 'node-typescript'
    });
  });

  // Get a single Note
  app.get('/notes/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return sendNoteNotFoundError(res);

    try {
      const note = storage.getNote(id);
      if (!note) return sendNoteNotFoundError(res);

      const tasks = storage.getNoteTasks(note.id);
      const { title, status } = note;
      res.json({ id, title, status, nbTasks: tasks.length });
    } catch (e) {
      console.error(e);
      return res
        .status(500)
        .send(JSON.stringify({ error: (e as Error).message }));
    }
  });

  // Get list of all Notes
  app.get('/notes', (req, res) => {
    try {
      const notes: any = storage.getNotes();

      /** add prorperty nbTasks on each note */
      /** Map to objects matching the API output, especially property nbTasks */
      const outputNotes = notes.map((n: any) => {
        const { id, title, status } = n;
        const tasks = storage.getNoteTasks(n.id);
        return { id, title, status, nbTasks: tasks.length };
      });
      res.json(outputNotes);
    } catch (e) {
      console.error(e);
      res.status(500).send(JSON.stringify({ error: (e as Error).message }));
      throw e;
    }
  });

  // Create a note
  app.post('/notes', (req, res) => {
    const { title, status } = req.body;
    const VALID_STATUSES = ['urgent', 'serious', 'unimportant'];

    // Check if title is provided
    if (!title) {
      return res.status(400).json({
        error: "The 'title' field is required."
      });
    }

    // Check if status is valid
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error:
          "Invalid status. Allowed values are 'urgent', 'serious', or 'unimportant'."
      });
    }

    // Proceed with creating the note if validation passes
    try {
      const note = storage.createNote({ title, status });
      res.json({ id: note.id, title, status, nbTasks: 0 });
    } catch (e) {
      console.error(e);
      return res
        .status(500)
        .send(JSON.stringify({ error: (e as Error).message }));
    }
  });

  // Delete a Note
  app.delete('/notes/:id', (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return sendNoteNotFoundError(res);

    try {
      storage.deleteNote(id) ? res.sendStatus(200) : sendNoteNotFoundError(res);
    } catch (e) {
      console.error(e);
      return res
        .status(500)
        .send(JSON.stringify({ error: (e as Error).message }));
    }
  });

  // Restore a deleted note
  app.put('/notes/:id/restore', (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return sendNoteNotFoundError(res);

    try {
      const restoredNote = storage.restoreNote(id);
      if (restoredNote === undefined) sendNoteNotFoundError(res);
      res.json(restoredNote);
    } catch (e) {
      console.error(e);
      return res
        .status(500)
        .send(JSON.stringify({ error: (e as Error).message }));
    }
  });

  // List tasks of a note
  app.get('/notes/:id/tasks', (req, res) => {
    const noteId = Number(req.params.id);
    if (Number.isNaN(noteId)) return sendNoteNotFoundError(res);

    try {
      const tasks = storage.getNoteTasks(noteId);
      /* Make output object that matches the API expected format */
      const outputObjects = tasks.map(t => ({ id: t.id, content: t.content }));
      res.json(outputObjects);
    } catch (e) {
      if (e instanceof InvalidNoteIdError) {
        return sendNoteNotFoundError(res);
      } else {
        console.error(e);
        return res
          .status(500)
          .send(JSON.stringify({ error: (e as Error).message }));
      }
    }
  });

  // Create a task for a note
  app.post('/notes/:id/tasks', (req, res) => {
    const noteId = Number(req.params.id);
    if (Number.isNaN(noteId)) return sendNoteNotFoundError(res);

    // Check if content is provided
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        error: "The 'content' field is required."
      });
    }

    try {
      const task = storage.createTask({ noteId, content });
      res.json({ ...task, noteId });
    } catch (e) {
      if (e instanceof InvalidNoteIdError) {
        return sendNoteNotFoundError(res);
      } else {
        console.error(e);
        return res
          .status(500)
          .send(JSON.stringify({ error: (e as Error).message }));
      }
    }
  });

  // Delete a task
  app.delete('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return sendTaskNotFoundError(res);

    try {
      storage.deleteTask(id) ? res.sendStatus(200) : sendTaskNotFoundError(res);
    } catch (e) {
      console.error(e);
      return res
        .status(500)
        .send(JSON.stringify({ error: (e as Error).message }));
    }
  });
}

/** Helpers */
function sendNoteNotFoundError(res: Response) {
  return res.status(404).send(JSON.stringify({ error: 'Note not found' }));
}

function sendTaskNotFoundError(res: Response) {
  return res.status(404).send(JSON.stringify({ error: 'Task not found' }));
}
