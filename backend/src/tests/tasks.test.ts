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

describe('GET /notes/:id/tasks  API Endpoint', () => {
  it('returns the list of tasks of a note', async () => {
    const createdNote = (
      await supertest(app)
        .post('/notes')
        .send({ title: 'My Note', status: 'urgent' })
    ).body;
    await supertest(app)
      .post(`/notes/${createdNote.id}/tasks`)
      .send({ content: 'Task 1' });
    await supertest(app)
      .post(`/notes/${createdNote.id}/tasks`)
      .send({ content: 'Task 2' });

    /* Note: right now I don't ensure that tasks are ordered in order of creation */
    let responseTasks = (
      await supertest(app).get(`/notes/${createdNote.id}/tasks`)
    ).body;
    expect(responseTasks.length).toEqual(2);
    expect(responseTasks).toContainEqual({
      id: expect.any(Number),
      content: 'Task 1'
    });
    expect(responseTasks).toContainEqual({
      id: expect.any(Number),
      content: 'Task 2'
    });
  });
});

describe('DELETE /tasks/:id API Endpoint', () => {
  let noteId: number;

  beforeEach(async () => {
    const noteResponse = await supertest(app)
      .post('/notes')
      .send({ title: 'Note for Deleting Task', status: 'urgent' });
    noteId = noteResponse.body.id;
  });

  it('Delete a task', async () => {
    const taskResponse = await supertest(app)
      .post(`/notes/${noteId}/tasks`)
      .send({ content: 'Task to be deleted' });
    const taskId = taskResponse.body.id;
    const response = await supertest(app).delete(`/tasks/${taskId}`);
    expect(response.status).toBe(200);

    const getResponse = await supertest(app).get(`/notes/${noteId}/tasks`);
    expect(getResponse.status).toBe(200);
    expect(
      getResponse.body.find(
        (task: { id: number; content: string }) => task.id === taskId
      )
    ).toBeUndefined();
  });
});
