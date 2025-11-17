import { default as express } from 'express';
import type { Express } from 'express';
import { program } from 'commander';
import { default as cors } from 'cors';
import * as httpApi from './httpApi.js';
import * as wsApi from './wsApi.js';
import { SqliteStorage } from './sqliteStorage.js';
import type { Storage } from './storage.js';
import { createServer, Server } from 'http';
import { WebSocketServer } from 'ws';

const env = process.env.NODE_ENV || 'development';
const isEnvProd = () => env === 'production';
const isEnvTest = () => env === 'test';

/**
 * Prepare command line arguments
 */
program.option(
  '-p, --port <PORT>',
  'Select port on which the server will be run',
  '3014'
);

program.option(
  '-f, --sqlite-file <SQLITE_DB_FILE>',
  'Path to the SQLite database file',
  '.storage.sqlite'
);

program.parse();
const port: number = Number(program.opts().port);
if (Number.isNaN(port)) {
  console.error(`Invalid port ${port}`);
  process.exit(1);
}

const sqliteDbPath = program.opts().sqliteFile;

/** Initialize storage */
const storage = new SqliteStorage({ dbPath: sqliteDbPath });


export type AppGlobals = {
  storage: Storage,
  expressApp: Express,
  httpServer: Server
}

export function setupApp(p: {storage: Storage}): AppGlobals {
  const {storage} = p;

  /** Setup Express server */
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  app.get('/version', (req, res) => {
    res.json({ version: '0.3' });
  });
  
  httpApi.setup(app, storage);
  
  const httpServer = createServer(app);
  wsApi.setup(httpServer, storage);

  return {storage, expressApp: app, httpServer};
}

const {httpServer} = setupApp({storage});

if (!isEnvTest()) {
  // Start the server
  httpServer.listen({ port }, () =>
    console.log(
      `Server is running on port ${port}. You can access the backend at http://localhost:${port}`
    )
  );
}
