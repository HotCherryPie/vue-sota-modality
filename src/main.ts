import { createApp } from 'vue';

import App from './app.vue';
import { modalsScope, notificationsScope } from './hooks/modality/scopes';
import './styles/styles.css';
import { createModalityLayoutState } from './ui-kit';

const app = createApp(App);

app.runWithContext(() => {
  createModalityLayoutState(app, modalsScope);
  createModalityLayoutState(app, notificationsScope);
});

app.mount('#app');
