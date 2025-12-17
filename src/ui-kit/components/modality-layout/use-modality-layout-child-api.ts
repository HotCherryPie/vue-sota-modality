import { inject } from 'vue';

import { DEFAULT_INTERNAL_STATE_INJECTION_KEY } from './modality-layout';
import type { Types } from './modality-layout';
import { MODALITY_LAYOUT_CHILD_CONTEXT_KEY } from './modality-layout-child-context';

export const useModalityLayoutChildApi = (
  scope: Types.Scope = DEFAULT_INTERNAL_STATE_INJECTION_KEY,
) => {
  const state = inject(scope);
  const context = inject(MODALITY_LAYOUT_CHILD_CONTEXT_KEY);

  if (context === undefined || state === undefined) return;

  const dismiss = (
    action: Types.Child.DismissAction,
    promise?: Promise<unknown>,
  ) => void state.dismissChild(context.descriptor.key, action, promise);

  const requestDismiss = (action: Types.Child.DismissAction) =>
    void state.requestChildDismiss(context.descriptor.key, action);

  return { context, dismiss, requestDismiss } as const;
};
