# Frontend Web Development 2025/2026, Assignment n°3, VueJS


## Submission procedure


- Use Git to version your project. You will submit a link to your git repository, on the assignment page
  of [Moodle](https://ecampus.emse.fr/mod/assign/view.php?id=41392)

- Work in groups of 2 or 3 students. Submissions of student that are not in a work group are not accepted.


### Getting the project running

For this project, you will have to run a backend server, that serves a basic HTTP API, and a WebSocket API.

And a second server, that will compile the Vue sources, generate debugging information for the web browser, 
provide live reloading, and serve your frontend (HTML and linked sources).

#### Prerequesites

The backend and frontend servers are coded with NodeJS. You need to have a working
installation of NodeJS (> 18.18) on your machine. 


#### Running the backend

1. Go to the `backend/` directory. 
2. Install dependencies with 

    ```
    npm install
    ```

2. Start the server with

    ```
    npm run start
    ```

3. By default the backend server runs on port 3014, you can access it at http://localhost:3014
4. It stores its data in a local SQLite database. It empty by default.

   If you want to reset your database with an initial sample data, run

    ```
    npm run db:reset
    ```

    If you want to reset your database to an empty one, delete the `.storage.sqlite` file.

#### Starting the frontend server

1. Go to the `frontend/` directory. 
2. The first time, you need to install the project dependencies

    ```
    npm install
    ```

    No need to run this command again after that.

3. Start the server with

    ```
    npm run dev
    ```

4. By default the frontend server runs on port 5173, you can access it at http://localhost:5173.
   
   This server is a development server provided by the VueJS framework. It has a "live-reload"
   feature. That means than each time you modify a source file in your project, the browser
   is notified and will automatically reload the page. It will also display any parsing or 
   compilation error if any.

### Backend API Specifiation

If you are using VS Code, "Thunder Client" is an excellent plugin that helps you easily
test a server API by hand-crafting HTTP requests.

Another tool good tool is [Bruno](https://usebruno.com)

You can also use the command line tool `curl`, although it's not as user friendly.

The backend API specification for the project is located at [backend/API_SPECIFICATION.md](./backend/API_SPECIFICATION.md)

### Instructions

Detailled instructions here: [Instructions](./EXPECTED_FUNCTIONALITIES.md)

### Public online backend

The backend is also running online at https://vps.quentin-richaud.eu:4001 (for HTTP requests) and wss://vps.quentin-richaud.eu:4001
for WebSockets. You can use it if you want to easily try how your frontend works with multiple users simultenaously.

You can test it works, buy checking the endpoint [/version](https://vps.quentin-richaud.eu:4001/version)

### Example frontend implementation

I have made an example working frontend here: https://cours-dev-wep-tp-6-working-implementation-f6891d.gitlab.io/
