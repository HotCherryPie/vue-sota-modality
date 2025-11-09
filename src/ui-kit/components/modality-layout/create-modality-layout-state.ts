import type { App } from 'vue';

import {
  DEFAULT_INTERNAL_STATE_INJECTION_KEY,
  createState,
} from './modality-layout';
import type { Types } from './modality-layout';

export const createModalityLayoutState = (
  app?: App,
  scope: Types.Scope = DEFAULT_INTERNAL_STATE_INJECTION_KEY,
): Types.Props.ExternalState => {
  const state = createState();

  app?.provide(scope, state);

  return state;
};
