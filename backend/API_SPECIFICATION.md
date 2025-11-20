# API Specification

[[_TOC_]]

## HTTP API Endpoints

### Notes
#### Create a Note

**Endpoint:** `POST /notes`

**Request Body:**

- `title` (string) - **required**: The title of the note.
- `status` (string) - **required**: The status of the note. Allowed values are `"urgent"`, `"serious"`, and `"unimportant"`.

**Example Request:**

```json
{
  "title": "My Note",
  "status": "urgent"
}
```

**Response:**

- `200 OK` on success with the created note object:

    ```json
    {
        "id": 1,
        "title": "My Note",
        "status": "urgent",
        "nbTasks": 0
    }
    ```

- `400 Bad` Request if:
    - title is missing.
    - status is missing or not one of the allowed values.

    **Example Error Response:**

    ```json
    {
    "error": "The 'title' field is required."
    }
    ```

#### Get a Note

**Endpoint:** `GET /notes/:id`

**Response:**

- `200 OK` with the note object:

    ```json
    {
        "id": 1,
        "title": "My Note",
        "status": "urgent",
        "nbTasks": 2
    }
    ```

- `404 Not Found` if the note does not exist.

#### List All Notes

**Endpoint:** `GET /notes`

**Response:**

- `200 OK` with an array of all note objects:

    ```json
    [
        {
        "id": 1,
        "title": "My Note",
        "status": "urgent",
        "nbTasks": 2
        },
        {
        "id": 2,
        "title": "Another Note",
        "status": "serious",
        "nbTasks": 0
        }
    ]
    ```

#### Delete a Note

**Endpoint:** `DELETE /notes/:id`

**Response:**

- `200 OK` if the note was deleted successfully.
- `404 Not Found` if the note does not exist.

#### Restore a deleted Note

**Endpoint:** `PUT /notes/:id/restore`

**Response:**

- `200 OK` with a JSON object containing the restored note

```
{
    "id": 1,
    "title": "My note",
    "status": "urgent",
    "tasks": [{
        "id": 1,
        "content": "My Task Content"
    }, 
    ...
    ]
}

```

- `404 Not Found` if no deleted note with this id exist

### Tasks
#### Create a Task for a Note

**Endpoint:** `POST /notes/:id/tasks`

**Request Body:**

- `content` (string) - **required**: The content of the task.

**Example Request:**

```json
{
  "content": "My Task Content"
}
```

**Response:**

- `200 OK` with the created task object:

    ```json
    {
    "id": 1,
    "content": "My Task Content",
    "noteId": 1
    }
    ```

- `400 Bad Request` if content is missing.

- `404 Not Found` if the note does not exist.

#### List Tasks of a Note

**Endpoint:** `GET /notes/:id/tasks`

**Response:**

- `200 OK` with an array of tasks for the specified note:

    ```json
    [
        {
        "id": 1,
        "content": "My Task Content"
        },
        {
        "id": 2,
        "content": "Another Task"
        }
    ]
    ```

- `404 Not Found` if the note does not exist.

#### Delete a Task

**Endpoint:** `DELETE /tasks/:id`

**Response:**

- `200 OK` if the task was deleted successfully.
- `404 Not Found` if the task does not exist.


## Error Handling

The API returns `400 Bad Request` for validation errors, `404 Not Found` for missing resources, and `500 Internal Server Error` for unexpected server issues.

#### Example 400 Error Response:

```json
{
  "error": "Invalid status. Allowed values are 'urgent', 'serious', or 'unimportant'."
}
```

## Websocket API

Create a connection on `ws://<host-domain>:<port>`

The server will send you any updates that happen on the notes, so you can be notified if another user 
makes changes simultenaously.

Format of the messages from the server depending on the type of event:

### Existing note is updated

This message is sent when the tasks of a note change (tasks were added or removed). Our server
does not support other kind of modifications on a note.

```json
{
    "event": "noteUpdated",
    "note": {
        "id": 1,
        "title": "My note",
        "status": "urgent",
        "tasks": [{
            "id": 1,
            "content": "My Task Content"
        }, 
        ...
        ]
    }
}
```

### New note is created

This message is sent when a new note is created. New notes always start with zero tasks, so they are 
not sent in the message.

```json
{
    "event": "noteCreated",
    "note": {
        "id": 1,
        "title": "My note",
        "status": "urgent"
    }
}
```

### Existing note is deleted

An existing note was deleted. Only the note id is sent.

```json
{
    "event": "noteDeleted",
    "note": {
        "id": 1
    }
}
```
