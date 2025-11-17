import { WebSocketServer } from 'ws';
import { type Storage } from './storage.js';
import { IncomingMessage, Server, ServerResponse } from 'http';

let wss: WebSocketServer | undefined;

export function setup(
  server: Server<typeof IncomingMessage, typeof ServerResponse>,
  storage: Storage
) {
  wss = new WebSocketServer({ server });

  wss.on('connection', ws => {
    ws.on('error', err => console.error('Unexpected websocket error:', err));

    /** For each connection, setup observers for any change on the model, and send the appropriate message
     *
     * Message format must match the API documentation in README.md
     *
     * Cleanup observers on connection close
     *
     */
    const observerIds: Array<number> = [];
    ws.on('close', () => {
      console.log('Connections closed');
      observerIds.forEach(obsId => storage.removeObserver(obsId));
    });

    observerIds.push(
      storage.onNoteCreate(note => {
        const { id, title, status } = note;
        ws.send(
          JSON.stringify({
            event: 'noteCreated',
            note: { id, title, status }
          })
        );
      })
    );

    observerIds.push(
      storage.onNoteUpdate(note => {
        console.log('Running on note update callback');
        const { id, title, status } = note;
        const tasks: Array<{ id: number; content: string }> = storage
          .getNoteTasks(id)
          .map(t => ({ id: t.id, content: t.content }));
        ws.send(
          JSON.stringify({
            event: 'noteUpdated',
            note: { id, title, status, tasks }
          })
        );
      })
    );

    observerIds.push(
      storage.onNoteDelete(note => {
        ws.send(
          JSON.stringify({
            event: 'noteDeleted',
            note: { id: note.id }
          })
        );
      })
    );
  });
}

/* FIXME: check again after github issue was answered */
//function clearDeadConnections() {
//  if (wss === undefined) throw new Error("Unitialized web socket server");
//
//  const interval = setInterval(function ping() {
//    wss.clients.forEach(function each(ws) {
//      if (ws.isAlive === false) return ws.terminate();
//
//      ws.isAlive = false;
//      ws.ping();
//    });
//  }, 30000);
//
//  wss.on('close', function close() {
//    clearInterval(interval);
//  });
//}
