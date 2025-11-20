import { expect, it, beforeAll, describe } from 'vitest';
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

describe('/version API endpoint', () => {
  it('Returns the current version and platform', async () => {
    const response = await supertest(app).get('/version');

    expect(response.status).toBe(200);
    expect(response.body.version).toEqual('1.1.2');
    expect(response.body.platform).toEqual('node-typescript');
  });
});
