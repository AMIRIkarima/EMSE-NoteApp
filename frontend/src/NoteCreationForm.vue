<template>
    <div class="note unimportant">
        <!-- 
          TODO add a class that reflect the variable `newNoteStatus` in order to have the 
          background color updated according to it
        -->
        <input class="new-note-title" placeholder="Enter note title...">
        
        <div class="status-select">
            <div>
                <input type="radio" id="unimportant" v-model="newNoteStatus" value="unimportant" />
                <label for="unimportant">Unimportant</label>
            </div>

            <div>
                <input type="radio" id="serious" v-model="newNoteStatus" value="serious" />
                <label for="serious">Serious</label>
            </div>

            <div>
                <input type="radio" id="urgent" v-model="newNoteStatus" value="urgent" />
                <label for="urgent">Urgent</label>
            </div>
        </div>

        <!-- 
          We bind the native "click" event to the method createNewNote, 
          see: https://vuejs.org/guide/essentials/event-handling.html
        -->
        <button class="create-btn" @click="createNewNote">Create new note</button>
    </div>
</template>



<script>
export default {
  data() {
    return {
      newNoteStatus: 'unimportant'  // default value for "newNoteStatus"
    }
  },
  /** 
   * Here we declare what custom events this component can emit. This is optionnal, but a good 
   * practice to document your component, and help the developpers tools to show warnings if you mishandle this
   * component.
   *
   * See: https://vuejs.org/guide/components/events.html
   */
  emits: ['onNoteCreated'],
  methods: {
    createNewNote() {
        /* TODO: 
         *
         * - perform checks that the data is valid, or be sure that this method can't be called with 
         *   invalid data, if you perform checks elsewhere
         * - send a request to the server to create a new note object
         * - handle possible error cases (more likely, display a pop up message that says that an unexpected error
         *   occured)
         * - on success, read the response from the server to get the complete note object (with its ID, and any possible
         *   new data that the server created by default)
         * - send the new note object as a custom event, so the parent component of this one can be aware of the new note.
         *   For this we will use this.$emit('onNoteCreated', newNote)
         */
    }
  }
}

</script>



<style lang="scss" scoped>
@use 'sass:color';
@use 'assets/stylesheets/colors.scss' as appColors;
@use 'assets/stylesheets/noteCard.scss';

$gutter-size: 15px;


.note {
  @include noteCard.noteCard;

    & > input {
        padding: 15px 5px 15px 5px;
        border: 0;
        font-size: 20px;
        width: 100%;
        border-radius: 5px;

        &::placeholder {
            font-style: italic;
            color: white;
        }
    }

    & > .create-btn {
        padding: 10px 5px 10px 5px;
        width: 100%;
        background-color: white;
        color: appColors.$dark-green;
        font-weight: bold;
        font-size: 15px;
    }

    &.unimportant {
      & > input {
        background-color: appColors.$light-green;
        color: color.adjust(appColors.$dark-green, $blackness: 20%);
      }
    }

    &.serious {
      & > input {
        background-color: appColors.$light-yellow;
        color: color.adjust(appColors.$dark-yellow, $blackness: 20%);
      }
    }

    &.urgent {
      & > input {
        background-color: appColors.$light-red;
        color: color.adjust(appColors.$dark-red, $blackness: 20%);
      }
    }

    .status-select {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        margin-top: 10px;
        margin-bottom: 10px;
        
        &  input {
            margin-right: 5px;
        }
    }
}

</style>
