import { expect, it, beforeEach, beforeAll, describe } from 'vitest';
import { default as supertest } from 'supertest';
import type { Express } from 'express';
import { SqliteStorage } from '../sqliteStorage.js';
import { setupApp } from '../index.js';

let app: Express;
let db: SqliteStorage;

beforeAll(() => {
  db = new SqliteStorage();
  const appGlobals = setupApp({ storage: db });
  app = appGlobals.expressApp;
});

beforeEach(() => {
  /* Reset database before each test */
  db.deleteTables();
  db.createTables();
});

describe('/notes/:id/tasks API Endpoints', () => {
  let noteId: number;

  beforeEach(async () => {
    const response = await supertest(app)
      .post('/notes')
      .send({ title: 'Note for Task Test', status: 'urgent' });
    noteId = response.body.id;
  });

  it('Create a new task for a note', async () => {
    const response = await supertest(app)
      .post(`/notes/${noteId}/tasks`)
      .send({ content: 'My Task Content' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.content).toBe('My Task Content');
    expect(response.body.noteId).toBe(noteId);
  });

  it('List tasks of a note', async () => {
    await supertest(app)
      .post(`/notes/${noteId}/tasks`)
      .send({ content: 'Content 1' });
    await supertest(app)
      .post(`/notes/${noteId}/tasks`)
      .send({ content: 'Content 2' });
    await supertest(app)
      .post(`/notes/${noteId}/tasks`)
      .send({ content: 'Content 3' });

    const response = await supertest(app).get(`/notes/${noteId}/tasks`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(3);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0].content).toBe('Content 1');
  });
});
