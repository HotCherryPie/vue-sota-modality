import { createApp } from 'vue';

import App from './app.vue';
import { modalsScope, notificationsScope } from './hooks/modality/scopes';
import './styles/styles.css';
import { createModalityLayoutState } from './ui-kit';

const app = createApp(App);

app.runWithContext(() => {
  app.provide(modalsScope, createModalityLayoutState());
  app.provide(notificationsScope, createModalityLayoutState());
});

app.mount('#app');
