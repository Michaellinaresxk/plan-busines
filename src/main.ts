import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from '@/UI/router';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

const app = createApp(App);

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#6366F1',
          secondary: '#8B5CF6',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
          surface: '#FFFFFF',
          background: '#F1F5F9',
        }
      },
      dark: {
        colors: {
          primary: '#818CF8',
          secondary: '#A78BFA',
          success: '#34D399',
          warning: '#FCD34D',
          error: '#F87171',
          info: '#60A5FA',
          surface: '#1E293B',
          background: '#0F172A',
        }
      }
    }
  }
});

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.mount('#app');
