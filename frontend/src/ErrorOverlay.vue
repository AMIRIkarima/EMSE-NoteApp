<template>
  <!-- Overlay hidden by default. Set `show` to true to display the error overlay -->
  <div v-show="show" class="error-overlay">
    <div class="error-window">
      <div class="error-message">An unexpected error occurred</div>
      <button class="close-btn">Close</button>
    </div>
    <div class="background"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false
    };
  }
}
</script>

<style lang="scss">
@use 'assets/stylesheets/mediaQueryScreens.scss';

.error-overlay {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 100;

  display: flex;
  align-items: center;
  justify-content: center;

  .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: gray;
    opacity: 0.5;
  }

  .error-window {
    position: relative;
    z-index: 101;
    background-color: white;
    opacity: 1;
    border-radius: 5px;
    padding: 20px;
    min-width: 300px;
    max-width: 700px;

    @include mediaQueryScreens.small {
      max-width: 90vw;
    }

    .error-message {
      font-size: 20px;
      margin-bottom: 20px;
      white-space: pre-wrap;
    }
  }

  .close-btn {
    padding: 10px 5px 10px 5px;
    width: 100%;
    background-color: red;
    color: white;
    font-weight: bold;
    font-size: 15px;
    width: 100px;
  }
}
</style>
