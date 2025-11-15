import { createApp } from 'vue';

import App from './app.vue';
import { modalsScope, notificationsScope } from './hooks/modality/scopes';
import './styles/styles.css';
import { createModalityLayoutState } from './ui-kit';

const app = createApp(App);

createModalityLayoutState(modalsScope, app);
createModalityLayoutState(notificationsScope, app);

app.mount('#app');
