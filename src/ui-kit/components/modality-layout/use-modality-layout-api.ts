import { inject } from 'vue';

import { INTERNAL_STATE_INJECTION_KEY } from './modality-layout';

export const useModalityLayoutApi = () => {
  const state = inject(INTERNAL_STATE_INJECTION_KEY);

  if (state === undefined)
    throw new Error('<ModalityLayout> is missing in current scope!');

  // eslint-disable-next-line ts/no-unused-vars
  const { children, ...filteredState } = state;

  return filteredState;
};
