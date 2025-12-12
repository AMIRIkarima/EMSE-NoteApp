<template>
    <div :class="['note', note.status]">
        <div class="delete-button" @click="onDelete">&#x1F5D1;</div>

        <!-- variable binding using Vue template syntax, see: https://vuejs.org/guide/essentials/template-syntax.html -->
        <h2>{{note.title}}</h2>

        <div class="tasks">
          <div class="task" v-for="task in tasks" :key="task.id">
            <div class="content">{{ task.content }}</div>
            <div class="delete-button" @click="deleteTask(task.id)">&#x1F5D1;</div>
          </div>

            <div class="new-task">
              <input
                class="content"
                placeholder="Enter new task..."
                v-model="newTaskContent"
                @keyup.enter="createTask"
              >
              <button class="create-btn" @click="createTask">+</button>
            </div>
        </div>
    </div>
</template>



<script>
  import { HOST } from './config.js'

  export default {
    emits: ['delete-note', 'tasks-updated'],
    /** 
     * Here I define the properties that are accepted by my component. Parent component of this one can pass down
     * data through that property, using HTML attribute syntax in their template: <MyComponent :myProperty="someData"></MyComponent>
     *
     * The property will be accessible in our template and methods just like a variable defined in `data`
     *
     * See: https://vuejs.org/guide/components/props.html
     */
    props: ['note'],
    data() {
      return {
        tasks: [],
        newTaskContent: ''
      }
    },
    mounted() {
      // load tasks for this note
      fetch(`${HOST}/notes/${this.note.id}/tasks`)
        .then(res => res.json())
        .then(tasks => this.tasks = tasks)
        .catch(err => console.error('Failed to load tasks for note', this.note.id, err))
    },
    methods: {
      async createTask() {
        const content = (this.newTaskContent || '').trim()
        if (!content) return
        try {
          const res = await fetch(`${HOST}/notes/${this.note.id}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
          })
          if (!res.ok) {
            const body = await res.text().catch(() => '')
            console.error('Failed to create task', res.status, body)
            alert('Failed to create task')
            return
          }
          const task = await res.json()
          this.tasks.push(task)
          this.newTaskContent = ''
          this.$emit('tasks-updated', this.note.id, this.tasks.length)
        } catch (e) {
          console.error(e)
          alert('An unexpected error occurred while creating the task')
        }
      },

      onDelete() {
        this.$emit('delete-note', this.note.id)
      },
      async deleteTask(taskId) {
        try {
          const res = await fetch(`${HOST}/tasks/${taskId}`, { method: 'DELETE' })
          if (!res.ok) {
            const body = await res.text().catch(() => '')
            console.error('Failed to delete task', taskId, res.status, body)
            alert('Failed to delete task')
            return
          }
          // remove task locally
          this.tasks = this.tasks.filter(t => t.id !== taskId)
          // notify parent so it can update nbTasks
          this.$emit('tasks-updated', this.note.id, this.tasks.length)
        } catch (e) {
          console.error(e)
          alert('An unexpected error occurred while deleting the task')
        }
      }
    }
  }
</script>



<style lang="scss" scoped>
@use 'sass:color';
@use 'assets/stylesheets/mediaQueryScreens.scss' as *;
@use 'assets/stylesheets/colors.scss' as appColors;
@use 'assets/stylesheets/noteCard.scss';



.note {
  @include  noteCard.noteCard;
  position: relative;

  & > .delete-button {
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 25px;
    cursor: pointer;
  }


  h2 {
    padding-bottom: 5px;
    width: calc(100% - 25px);
  }

  .task {
    padding: 10px 5px 10px 5px;
    margin-bottom: 10px;
  }



  .task {
    border-radius: 5px;
    display: flex;
    align-items: center;

    & > .content {
      flex-grow: 1;
    }

    & > .delete-button {
      visibility: hidden;
      flex-grow: 0;
      color: black;
      font-size: 20px;
      cursor: pointer;
    }


    &:hover > .delete-button {
      visibility: visible;
    }
  }


  .new-task {
    display: flex;  

    & > input { 
      flex-grow: 1;
      border: 0;
      padding: 15px 5px 15px 5px;

      &::placeholder {
        color: white;
      }
    }

    & > .create-btn {
      background-color: white;
      font-size: 25px;
      font-weight: bold;
      width: 40px;
    }
  }


  &.unimportant {
    .task, .new-task > input {
      background-color: appColors.$light-green;
      color: color.adjust(appColors.$dark-green, $blackness: 20%);
    }

    .new-task > .create-btn {
      color: appColors.$dark-green;
    }
  }

  &.serious {
    .task, .new-task > input {
      background-color: appColors.$light-yellow;
      color: color.adjust(appColors.$dark-yellow, $blackness: 20%);
    }

    .new-task > .create-btn {
      color: appColors.$dark-yellow;
    }
  }

  &.urgent {
    .task, .new-task > input {
      background-color: appColors.$light-red;
      color: color.adjust(appColors.$dark-red, $blackness: 20%);
    }

    .new-task > .create-btn {
      color: appColors.$dark-red;
    }
  }
}


</style>
