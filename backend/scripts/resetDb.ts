import {
  deleteAndRecreateFileDatabase,
  populateDatase
} from '../src/dbUtil.js';
import { createTables } from '../src/sqliteStorage.js';

const db = deleteAndRecreateFileDatabase('.storage.sqlite');
createTables(db);
populateDatase(db);
db.close();
console.log('Database reset complete.');
