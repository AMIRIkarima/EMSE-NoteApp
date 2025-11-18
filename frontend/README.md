# EMSE's Notes Board

This is the starting place to implement the frontend of our Notes application.

The project was scaffolded by Vue JS default tool (+ some minor configuration adjustements
I made). It uses Vite as a bundler, that provide you the following functionalities out of the box:

- Transpile .vue files into regular JS and CSS files
- Inject all these generated file into `index.html` so the browser just has to load index.html and
  have your application working
- In development mode, it provides a Hot Module Reloader: it detect any changes you make to your 
  files, recompiles them and trigger a reload in the web browser
- It can transpile other languages that you use in the .Vue files as regular JS and CSS (for example
  you can use Typescript and Sass).
- If you build your project for deployment (not necessary within the context of this assignment),
  it will bundle and minify your JS and CSS code into a single file. You can check it by running
  `npm run build` and looking what's in the `dist/` directory. You could then serve your application
  with a minimalist web server, and just the content of the `dist/` directory.

# Commands

## Install the dependencies

The development environment (all the Vue tools, the Vite bundler, etc.) runs with NodeJS. You need
to install all nodeJS dependencies on the first time with: 

```
npm install
```

If you don't install new dependencies, you won't need to run it again. Dependencies are installed in 
the `node_modules` directory. If you delete this directory, you can always run again the install command.

```

## Start the development server

```
npm run dev
```

Normally you will only need this for the project. The server should auto reload your app each time you make
a change. However, sometimes after a compile error, it fails to detect new changes, you may need to restart it.

## Build the application for deployment

```
npm run build
```
