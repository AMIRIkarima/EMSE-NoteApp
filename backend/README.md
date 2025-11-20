# EMSE Notes App Backend 

This backend provides an HTTP RESTful API for managing notes and tasks. It also provide a WebSocket API to be notified
of changes in the model.

Notes can have multiple associated tasks, and each task belongs to a specific note. 

The API provides endpoints to create, retrieve, update, and delete notes and tasks.

[[_TOC_]]

# Getting started

1. Install dependencies:

   ```bash
   npm install
   ```


3. Start the server:

    ```bash
    npm run start
    ```

2. If you want to reset the database (erase existing data), you can run

        ```bash
        npm run db:reset
        ```

The server will start on http://localhost:3014 by default.

---

# API Specification

See [API_SPECIFICATION.md](./API_SPECIFICATION.md)

# Developper information (not for students)

## Typescript

Source file must be transpiled `npx tsc`. Beware, if you specify manually a file path, the tsconfig.json is ignored.

To run the server, first transpile the source, then run node on the generated JS: `npx tsc && node dist/server.js`.

To run the test, first transpile the source tests, then run vitest on the generated JS: `npx tsc && npx vitest dist/test`
(the vitest config files points directly to the dist/test folder)

The source map are generated, so vitest will output debug info pointing to the source typescript file, and node debugging 
will also work.

## Debugging

### To debug the test suites: 

```bash
npx vitest --inspect-brk --no-file-parallelism  --test-timeout=0 dist/test/messages.test.js
```

Possible bug when the previous node process doesn't stop listening on the debug port 9229. Is this case,
check processes still attached to that port with:

```bash
lsof -i :9229
```

And kill them.


### To debug directly the application

```bash
npx node --inspect-brk dist/server.js
```

(Running `ts-node --inspect-brk` doesn't work for whatever reason, it doesn't catch the flag `--inspect-brk`)


### Attach chrome d-ebugger

Open chrome://inspect 

