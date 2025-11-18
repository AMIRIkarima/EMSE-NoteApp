import { createApp } from 'vue'
import './assets/stylesheets/main.scss'

/** This the root component of the Vue application */
import App from './App.vue'


/** 
 *
 * The vue application will be "mounted" on the HTML element with id="vue-app", then the
 * vue engline (javascript code), will render dynamically all the HTML templates that you defined 
 * in the App component and its children.
 *
 */
createApp(App).mount('#vue-app')
