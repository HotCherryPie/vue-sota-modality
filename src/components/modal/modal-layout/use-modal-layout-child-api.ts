import { useCurrentElement } from '@vueuse/core';
import type { MaybeElement } from '@vueuse/core';
import { watch, inject, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

import { isNil, useBodyScrollLock, useCloseWatcher } from '../../../utils';

import { RichCancelEvent, RichCloseEvent } from './events';
import { ModalLayoutChildContextKey } from './modal-layout-child-context';
import type { ModalDismissAction, ModalDismissSource } from './types';

const getRootHtmlElement = (element: MaybeElement) => {
  if (isNil(element)) return;
  // eslint-disable-next-line ts/no-unsafe-type-assertion -- it's fine
  if ('$el' in element) return element.$el as Element;
  return element;
};

type UseModalLayoutChildApiInit = {
  /**
   * Locks scroll on body. Releases automatically on moment, when modal
   *  becomes dismissed (before close animation).
   *
   * @default false
   */
  lockScroll?: MaybeRefOrGetter<boolean> | undefined;

  /**
   * If `true`, component won't be removed from dom immediately, but
   *  only after manually calling `commitClosedState()`.
   *
   * @default false
   */
  defferClose?: boolean;
};

/**
 * Limitations:
 *  - Should be used only once per active modal;
 *  - Component should be single-rooted;
 *  - Components between client of this hook and ModalLayout should not define
 *    `close` and `cancel` events;
 */
export function useModalLayoutChildApi(init: UseModalLayoutChildApiInit) {
  const rootElement = useCurrentElement();
  const isBodyScrollLocked = useBodyScrollLock(toValue(init.lockScroll));

  const closePromise =
    // eslint-disable-next-line ts/no-invalid-void-type -- no here
    init.defferClose ? Promise.withResolvers<void>() : undefined;
  let isClosingOrClosed = false;

  // eslint-disable-next-line ts/no-non-null-assertion
  const context = inject(ModalLayoutChildContextKey)!;

  const onClose = (action: ModalDismissAction) => {
    const element = getRootHtmlElement(rootElement.value);

    if (isClosingOrClosed || element === undefined) return;

    // We allow scrolling earlier to not make the user to wait for the end of the animation
    isBodyScrollLocked.value = false;
    isClosingOrClosed = true;

    const event = new RichCloseEvent(action, closePromise?.promise);
    element.dispatchEvent(event);
  };

  const onCancel = (action: ModalDismissAction) => {
    const element = getRootHtmlElement(rootElement.value);

    if (isClosingOrClosed || element === undefined) return;

    const event = new RichCancelEvent(action);
    const shouldContinue = element.dispatchEvent(event);

    if (shouldContinue) onClose(action);
  };

  useCloseWatcher({
    enabled: context.active,
    abusive: true,
    onClose: () =>
      void onClose({
        intent: 'cancel',
        source: { origin: 'user', input: 'hardware', description: undefined },
      }),
    onCancel: () =>
      void onCancel({
        intent: 'cancel',
        source: { origin: 'user', input: 'hardware', description: undefined },
      }),
  });

  watch(
    context.requestedDismissAction,

    (it) => {
      // We use `onClose` here, because close requests from outside
      //  should be inevitable.
      if (it !== undefined) onClose(it);
    },
  );

  watch(
    () => toValue(init.lockScroll),
    (it = false) => {
      if (isClosingOrClosed) return;
      isBodyScrollLocked.value = it;
    },
  );

  return {
    ...context,
    commitClosedState: () => void closePromise?.resolve(),
    requestClose: (
      intent: ModalDismissAction.Intent,
      description?: ModalDismissSource.Description,
    ) =>
      void onCancel({
        intent,
        source: { origin: 'user', input: 'ui', description },
      }),
    close: (
      intent: ModalDismissAction.Intent,
      description?: ModalDismissSource.Description,
    ) =>
      void onClose({
        intent,
        source: { origin: 'user', input: 'ui', description },
      }),
  };
}
