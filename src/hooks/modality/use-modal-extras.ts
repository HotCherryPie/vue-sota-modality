import { watch } from 'vue';

import type { ModalityLayout } from '../../ui-kit';
import { useModalityLayoutChildApi, useModalityLayoutApi } from '../../ui-kit';
import {
  toValueWithArgument,
  useBodyScrollLock,
  useCloseWatcher,
} from '../../utils';
import type { MaybeReadonlyRefOrGetterWithArgument } from '../../utils';

export interface UseModalExtrasOptions {
  active?: MaybeReadonlyRefOrGetterWithArgument<
    boolean | undefined,
    ModalityLayout.Types.Child.Context
  >;

  /**
   * Locks scroll on body. Releases automatically on moment, when modal
   *  becomes dismissed (before close animation).
   *
   * @default false
   */
  lockScroll?: MaybeReadonlyRefOrGetterWithArgument<
    boolean | undefined,
    ModalityLayout.Types.Child.Context
  >;

  /**
   * If `true`, component won't be removed from dom immediately, but
   *  only after manually calling `commitClosedState()`.
   *
   * @default false
   */
  defferClose?: boolean;
}

// TODO: add focus restoration here (not in useModal!)
export const useModalExtras = (options: UseModalExtrasOptions) => {
  const childApi = useModalityLayoutChildApi();
  const layoutApi = useModalityLayoutApi();

  if (childApi === undefined || layoutApi === undefined)
    throw new Error('<ModalityLayout> is missing in current scope!');

  let isClosingOrClosed = false;
  const closePromise =
    // eslint-disable-next-line ts/no-invalid-void-type -- not here
    options.defferClose ? Promise.withResolvers<void>() : undefined;

  const isBodyScrollLocked = useBodyScrollLock(
    toValueWithArgument(options.lockScroll, childApi.context),
  );

  watch(
    () => toValueWithArgument(options.lockScroll, childApi.context),
    (it = false) => {
      if (isClosingOrClosed) return;
      isBodyScrollLocked.value = it;
    },
  );

  const onDismiss = (action: ModalityLayout.Types.Child.DismissAction) => {
    // We allow scrolling earlier to not make the user to wait for the end of the animation
    isBodyScrollLocked.value = false;
    isClosingOrClosed = true;

    childApi.dismiss(action, closePromise?.promise);
  };

  const onRequestDismiss = (
    action: ModalityLayout.Types.Child.DismissAction,
  ) => {
    childApi.requestDismiss(action);
  };

  useCloseWatcher({
    enabled: () => toValueWithArgument(options.active, childApi.context),
    abusive: true,
    onClose: () =>
      void onDismiss({
        intent: 'cancel',
        source: { origin: 'user', input: 'hardware', description: undefined },
      }),
    onCancel: () =>
      void onRequestDismiss({
        intent: 'cancel',
        source: { origin: 'user', input: 'hardware', description: undefined },
      }),
  });

  watch(
    () => childApi.context.descriptor.requestedDismissAction,

    (it) => {
      // We use `onClose` here, because close requests from outside
      //  should be inevitable.
      if (it !== undefined) onRequestDismiss(it);
    },
  );

  return {
    ...childApi,
    dismiss: onDismiss,
    requestDismiss: onRequestDismiss,
    commitClosedState: () => void closePromise?.resolve(),
  };
};
