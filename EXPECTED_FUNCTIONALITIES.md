# Instructions for the assignment

# Starting point

You start your project with a few things already implemented:

- There is a `index.html`, that is the root of our frontend. It is quite minimal, because most of the content will be generated
  by Vue (javascript code). You don't need to modify it, but you can inspect it.
- The `main.js` file, which is the starting point for our JS code (that's the only javascript source file we include in `index.html`),
  everything else is linked from this file.
- The root component of our app is defined in `App.vue`, and `main.js` mounts it to the HTML document
- Also, three others Vue components are already here, they are partially implemented: the `Note.vue` component, and the
  `NoteCreationForm.vue` component. The code is commented so you can follow what is going on in these existing components
- The `ErrorOverlay` component, which you will need to display error messages

What is working so far:

- On startup, the app loads the list of existing notes and displays them. It creates a `Note.vue` instance for each note.
- The note cards are colored according to their status.
- There is static HTML in place for tasks, but they are not loaded from the server yet (you'll need to implement that)

Note on stylesheets:

- I've written the stylesheets with SCSS, and configured the bundler (Vite), to transpile them to regular CSS.

# Guidelines for the development

## No 3rd party libraries

**Don't use any other libraries**. The scope of this assignment is restricted to using only what the Vue framework
provides out of the box, and native javascript.

There are tons of existing libraries, but it's not a good idea to overload a projects with dependencies when its 
scope is quite narrow like this one. 

It's also a good practice to be able to leverage what the language and the framework provide you, and put on practice
some well known design patterns.

## You can write JS modules outside of Vue components

It would be a mistake to try to program everything inside Vue components. The components files (`.vue`) are just
bricks of UI, the JS logic inside them is tightly coupled with the part of the UI they represent.

More generic code, and code that you want to be available accross your application, can be put into regular `.js`
modules. You can then import them into the script section of your Vue components.

## Use design patterns

Don't hesitate to write some tried and tested design patterns for resolving some problems. Here are two examples
I often use:

### The singleton pattern

Can be used to share a single WebSocket connection accross components

```js
let _singletonInstance; // private, not exported
export function getSingleton() {
    if (_singletonInstance === undefined) {
        _singletonInstance = createMySingleton() /* pseudo code */
    }

    return _singletonInstance;
}
```

### The observer pattern

I use this to manage error messages. My ErrorOverlay component registers an observer, and any other component
can send error messages.

```js
let observers = [];  // private

// observerToRegister must be a callback function, that takes the message object as first argument
export function onNewMessage(observerToRegister) {
    this.observers.push(observerToRegister);
}

// send a message object to all registered observers
export function sendMessage(message) {
    observers.forEach(observer => observer(message));
}
```

# Features to implement

## Displaying all tasks for each note

## Making the "trash" icon work on notes and individual tasks

You don't need to make a confirm dialog, a single click on the trash icon will delete the task or the note immediatly

(you need to delete on the server, and update your view accordingly)

## Implement the NoteCreationForm component

The user can create a new component by clicking the button or by pressing the <Enter> key. 

Don't make a server request if the inputs are empty.

Update the color of the form depending on the selected status for the new note.

Update the list of notes after a succesfull note creation

## Creating new tasks

Modify the Note component, to allow the creation of new tasks.

The user can create a task by clicking on the "+" button, or by pressing the <Enter> key

## Implement a filter widget

For this you will need to create a new component. It will look like this:

![filters mockup](./assets/Filters.png)

When the user clicks on a filter, you will display only the notes that match the selected filter.

Don't forget to make it visible which filter is currently selected.

You will need to use `emits` to communicate upward between your filter component and the rest of your app.

## Display error messages

For any unexpected error (on network requests), display a customized message in the ErrorOverlay. This is for
truely unexpected errors (ones you cannot prevent), not for validation of user input.

## Synchronizing the view thanks to WebSocket

To update the view of your app based on changes made by other users, you will subscribe to the websocket
provided by the backend: ws://localhost:3014

You can then receive messages as specified by the Backend API, that will tell you if notes were updated
(with new or less tasks), created or deleted.

You will use the native WebSocket API :  https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

Try to not open too many websockets connections (unecessary network overload). Ideally, only one connection
is necessary, and you make it available globally accross your application.

### Bonus feature

The HTTP provides an endpoint `PUT /notes/:id/restore`, that restores a Note that was previously deleted
(the note ID is still valid for this call).

You can use it to implement the following feature:

- When another user deletes a task, instead of hiding it immediatly in our UI, you can gray the deleted Note 
  (and disable any of its controls), and provide buttons that allows to confirm the deletion, or to restore
  the note.
