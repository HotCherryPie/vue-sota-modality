import { inject } from 'vue';

import { DEFAULT_INTERNAL_STATE_INJECTION_KEY } from './modality-layout';
import type { Types } from './modality-layout';

export const useModalityLayoutApi = (
  scope: Types.Scope = DEFAULT_INTERNAL_STATE_INJECTION_KEY,
) => {
  const state = inject(scope);

  if (state === undefined) return;

  // eslint-disable-next-line ts/no-unused-vars
  const { children, ...filteredState } = state;

  return {
    ...filteredState,
    // TODO: add `children.size`
  } as const;
};
