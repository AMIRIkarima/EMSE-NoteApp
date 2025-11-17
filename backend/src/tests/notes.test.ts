import { expect, it, beforeEach, beforeAll, afterAll, describe } from 'vitest';
import { default as supertest } from 'supertest';
import type { Express } from 'express';
import type { Database } from 'better-sqlite3';
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



describe('/notes API Endpoints', () => {
  it('Create a new note with valid title and status', async () => {
    const response = await supertest(app)
      .post('/notes')
      .send({ title: 'My Note', status: 'urgent' });

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.title).toBe('My Note');
    expect(response.body.status).toBe('urgent');
    expect(response.body.nbTasks).toBe(0);
  });

  it('Reject creation if title is missing', async () => {
    const response = await supertest(app)
      .post('/notes')
      .send({ status: 'urgent' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('The \'title\' field is required.');
  });

  it('Reject creation if status is missing', async () => {
    const response = await supertest(app)
      .post('/notes')
      .send({ title: 'My Note' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid status. Allowed values are \'urgent\', \'serious\', or \'unimportant\'.');
  });

  it('Reject creation if status is invalid', async () => {
    const response = await supertest(app)
      .post('/notes')
      .send({ title: 'My Note', status: 'invalid-status' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid status. Allowed values are \'urgent\', \'serious\', or \'unimportant\'.');
  });

  it('Get a single note', async () => {
    const note = (await supertest(app).post('/notes').send({ title: 'My Note', status: 'urgent' })).body;
    await supertest(app).post(`/notes/${note.id}/tasks`).send({ content: 'Content 1' });
    await supertest(app).post(`/notes/${note.id}/tasks`).send({ content: 'Content 2' });


    const response = await supertest(app).get(`/notes/${note.id}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.title).toBe('My Note');
    expect(response.body.status).toBe('urgent');
    expect(response.body.nbTasks).toBe(2);
  });

  it('Get list of notes', async () => {
    await supertest(app).post('/notes').send({ title: 'My Note1', status: 'urgent' });
    await supertest(app).post('/notes').send({ title: 'My Note2', status: 'urgent' });
    await supertest(app).post('/notes').send({ title: 'My Note3', status: 'urgent' });



    const response = await supertest(app).get('/notes');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(3);
    expect(response.body[0].id).toEqual(expect.any(Number));
    expect(response.body[0].title).toEqual(expect.any(String));
    expect(response.body[0].status).toEqual(expect.any(String));
    expect(response.body[0].nbTasks).toEqual(expect.any(Number));
  });

  it('Delete a note', async () => {
    const createdNote = (await supertest(app).post('/notes').send({ title: 'My Note', status: 'urgent' })).body;  

    const response = await supertest(app).delete(`/notes/${createdNote.id}`);
    expect(response.status).toBe(200);

    const getResponse = await supertest(app).get(`/notes/${createdNote.id}`);
    expect(getResponse.status).toBe(404); // Should return 404 as note is deleted
  });
});
