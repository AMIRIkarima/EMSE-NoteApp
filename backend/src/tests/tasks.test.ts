import { expect, it, beforeEach, beforeAll, afterAll, describe } from 'vitest';
import { default as supertest } from 'supertest';
import type { Express } from 'express';
import { SqliteStorage } from '../sqliteStorage.js';
import { setupApp } from '../index.js';


let app: Express;
let db: SqliteStorage;

beforeAll(() => {
  db = new SqliteStorage();
  const appGlobals = setupApp({storage: db});
  app = appGlobals.expressApp;
});

beforeEach(() => {
  /* Reset database before each test */
  db.deleteTables();
  db.createTables();
});



describe('/tasks/:id API Endpoints', () => {
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
    expect(getResponse.body.find((task: {id: number, content: string}) => task.id === taskId)).toBeUndefined();
  });
});
