import type { App } from 'vue';

import { INTERNAL_STATE_INJECTION_KEY, createState } from './modality-layout';
import type { Types } from './modality-layout';

export const createModalityLayoutState = (
  app?: App,
): Types.Props.ExternalState => {
  const state = createState();

  app?.provide(INTERNAL_STATE_INJECTION_KEY, state);

  return state;
};
