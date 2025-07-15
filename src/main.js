/* import './assets/main.css' */
// import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
// import JSON from './components/JSON.vue'

const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});

app.mount("#app");

