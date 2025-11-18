<template>
    <div :class="['note', note.status]">
        <div class="delete-button">&#x1F5D1;</div>

        <!-- variable binding using Vue template syntax, see: https://vuejs.org/guide/essentials/template-syntax.html -->
        <h2>{{note.title}}</h2>

        <div class="tasks">
          <div class="task">
            <div class="content">My task that needs to be done</div>
            <div class="delete-button">&#x1F5D1;</div>
          </div>

          <div class="new-task">
            <input class="content" placeholder="Enter new task...">
            <button class="create-btn">+</button>
          </div>
        </div>
    </div>
</template>



<script>
  export default {
    /** 
     * Here I define the properties that are accepted by my component. Parent component of this one can pass down
     * data through that property, using HTML attribute syntax in their template: <MyComponent :myProperty="someData"></MyComponent>
     *
     * The property will be accessible in our template and methods just like a variable defined in `data`
     *
     * See: https://vuejs.org/guide/components/props.html
     */
    props: ['note']
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
