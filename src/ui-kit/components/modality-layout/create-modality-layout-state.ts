import type { App } from 'vue';

import {
  DEFAULT_INTERNAL_STATE_INJECTION_KEY,
  createState,
} from './modality-layout';
import type { Types } from './modality-layout';

export const createModalityLayoutState = (
  scope: Types.Scope = DEFAULT_INTERNAL_STATE_INJECTION_KEY,
  app?: App,
): Types.Props.ExternalState => {
  const state = createState();

  app?.runWithContext(() => {
    app.provide(scope, state);
  });

  return state;
};
