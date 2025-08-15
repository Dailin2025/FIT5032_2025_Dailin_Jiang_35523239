import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './utils/accessibility.js'
import './services/authService.js' // Initialize authentication service
import toastService from './services/toastService.js'

createApp(App).use(router).mount('#app') 