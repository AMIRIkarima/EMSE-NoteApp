import { expect, it, beforeEach, beforeAll, describe } from 'vitest';
import { default as supertest } from 'supertest';
import type { Express } from 'express';
import { SqliteStorage } from '../sqliteStorage.js';
import { setupApp } from '../index.js';
import type { Note } from '../model.js';

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
    expect(response.body.error).toBe("The 'title' field is required.");
  });

  it('Reject creation if status is missing', async () => {
    const response = await supertest(app)
      .post('/notes')
      .send({ title: 'My Note' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Invalid status. Allowed values are 'urgent', 'serious', or 'unimportant'."
    );
  });

  it('Reject creation if status is invalid', async () => {
    const response = await supertest(app)
      .post('/notes')
      .send({ title: 'My Note', status: 'invalid-status' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Invalid status. Allowed values are 'urgent', 'serious', or 'unimportant'."
    );
  });

  it('Get a single note', async () => {
    const note = (
      await supertest(app)
        .post('/notes')
        .send({ title: 'My Note', status: 'urgent' })
    ).body;
    await supertest(app)
      .post(`/notes/${note.id}/tasks`)
      .send({ content: 'Content 1' });
    await supertest(app)
      .post(`/notes/${note.id}/tasks`)
      .send({ content: 'Content 2' });

    const response = await supertest(app).get(`/notes/${note.id}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.title).toBe('My Note');
    expect(response.body.status).toBe('urgent');
    expect(response.body.nbTasks).toBe(2);
  });

  it('Get list of notes', async () => {
    await supertest(app)
      .post('/notes')
      .send({ title: 'My Note1', status: 'urgent' });
    await supertest(app)
      .post('/notes')
      .send({ title: 'My Note2', status: 'urgent' });
    await supertest(app)
      .post('/notes')
      .send({ title: 'My Note3', status: 'urgent' });

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
    const createdNote = (
      await supertest(app)
        .post('/notes')
        .send({ title: 'My Note', status: 'urgent' })
    ).body;

    const response = await supertest(app).delete(`/notes/${createdNote.id}`);
    expect(response.status).toBe(200);

    const getResponse = await supertest(app).get(`/notes/${createdNote.id}`);
    expect(getResponse.status).toBe(404); // Should return 404 as note is deleted
  });
});

describe('/notes/:id/restore API endpoint', () => {
  it('Can restore a previously deleted note', async () => {
    /**
     *   - create a note, with tasks. check it appears in GET /notes
     *   - delete that note, check it does not appear anymore in GET /notes
     *   - check that GET /notes/:id gives 404
     *   - call /notes/:id/restore. Check status 200, and restored note object
     *   - check that it appears in GET /notes and GET /note/:id
     *   - check that tasks are restored too
     */

    /* Create a note with tasks */
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

    /* Check GET /notes has our created note */
    expect(
      (await supertest(app).get(`/notes`)).body.map((n: Note) => n.id)
    ).toContainEqual(createdNote.id);

    /* Check GET /note/:id has our created note */
    expect(
      (await supertest(app).get(`/notes/${createdNote.id}`)).status
    ).toEqual(200);

    /* Delete our created note */
    expect(
      (await supertest(app).delete(`/notes/${createdNote.id}`)).status
    ).toEqual(200);

    /* Check that it does not appear anymore in GET /notes */
    expect(
      (await supertest(app).get(`/notes`)).body.map((n: Note) => n.id)
    ).not.toContainEqual(createdNote.id);

    /* Check that it does  not appear in GET /notes/:id */
    expect(
      (await supertest(app).get(`/notes/${createdNote.id}`)).status
    ).toEqual(404);

    /* Restore the note. Check it returns the restored note object with its tasks */
    const res= await supertest(app).put(`/notes/${createdNote.id}/restore`)
    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject({id: createdNote.id, title: createdNote.title, status: createdNote.status})
    expect(res.body.tasks).toContainEqual({
      id: expect.any(Number),
      content: 'Task 1'
    });
    expect(res.body.tasks).toContainEqual({
      id: expect.any(Number),
      content: 'Task 2'
    });

    /* Check that it does appear again in GET /notes */
    let noteInGetResponse = (await supertest(app).get(`/notes`)).body.find(
      (n: Note) => n.id === createdNote.id
    );
    expect(noteInGetResponse.title).toEqual('My Note');
    expect(noteInGetResponse.status).toEqual('urgent');

    /* Check that it does  appear again in GET /notes/:id */
    noteInGetResponse = (await supertest(app).get(`/notes/${createdNote.id}`))
      .body;
    expect(noteInGetResponse.title).toEqual('My Note');
    expect(noteInGetResponse.status).toEqual('urgent');

    /* Check that we have the tasks */
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
