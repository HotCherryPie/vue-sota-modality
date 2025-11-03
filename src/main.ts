import { createApp } from 'vue';

import App from './app.vue';
import './styles/styles.css';
import { createModalityLayoutState } from './ui-kit';

const app = createApp(App);

app.runWithContext(() => {
  createModalityLayoutState(app);
});

app.mount('#app');
