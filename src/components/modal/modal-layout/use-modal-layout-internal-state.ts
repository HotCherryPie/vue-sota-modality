import { createSharedComposable, createEventHook } from '@vueuse/core';
import type { Component, Ref } from 'vue';
import { ref, shallowReactive, shallowRef } from 'vue';

import type {
  ModalDismissAction,
  ModalResolution,
  ModalViewDescriptor,
} from './types';

export const useModalLayoutInternalState = createSharedComposable(() => {
  // We should not care about any possible changes in descriptors.
  //  Also: `reactive` unwraps refs, but at least `requestedDismissAction` should be preserved "as is"
  const modals = shallowReactive(new Map<Component, ModalViewDescriptor>());

  const openEvent = createEventHook<{
    component: Component;
    descriptor: ModalViewDescriptor;
  }>();
  const dismissEvent = createEventHook<{
    component: Component;
    descriptor: ModalViewDescriptor;
  }>();

  const getModalForComponent = (modalComponent: Component) =>
    modals.get(modalComponent);

  const isSimilarModalAlreadyOpened = (modalComponent: Component) =>
    getModalForComponent(modalComponent) !== undefined;
  const isThisExactModalOpened = (key: string) =>
    // TODO: remove `Iterator.from()` after fix
    //  https://github.com/vuejs/core/issues/12615
    Iterator.from(modals.values()).some((it) => it.key === key);

  const openModal = (
    component: Component,
    key: string,
    data: unknown,
    value: Ref,
  ) => {
    if (isSimilarModalAlreadyOpened(component)) {
      if (import.meta.env.DEV) console.warn('Similar modal is already opened!');
      return;
    }

    const resolutionPromise = Promise.withResolvers<ModalResolution>();
    const descriptor = {
      key,
      data,
      value,
      isDismissed: ref(false),
      requestedDismissAction: shallowRef(),
      resolutionPromise,
      calledAt: performance.now(),
      dismissedAt: undefined,
    };

    modals.set(component, descriptor);
    void openEvent.trigger({ component: component, descriptor });

    return resolutionPromise.promise;
  };

  const callForModalDismiss = (
    modalComponent: Component,
    action: ModalDismissAction,
  ) => {
    const modal = getModalForComponent(modalComponent);

    if (modal === undefined) {
      if (import.meta.env.DEV)
        console.warn('You try to dismiss modal which is not presented yet!');
      return;
    }

    if (modal.isDismissed.value) {
      if (import.meta.env.DEV)
        console.warn('You try to dismiss already dismissed modal!');
      return;
    }

    // Request for dismiss. This this not real dismiss, because this action can
    //  be discarded further.
    modal.requestedDismissAction.value = action;
  };

  const scheduleModalRemoving = (
    modalComponent: Component,
    removePromise: Promise<unknown>,
    action: ModalDismissAction,
  ) => {
    const modal = getModalForComponent(modalComponent);

    if (modal === undefined) {
      if (import.meta.env.DEV)
        console.warn(
          '.scheduleModalRemoving() was called for non-presented modal!',
        );
      return;
    }

    modal.isDismissed.value = true;
    modal.dismissedAt = performance.now();
    modal.requestedDismissAction.value = action;
    modal.resolutionPromise.resolve({ value: modal.value.value, action });

    void dismissEvent.trigger({ component: modalComponent, descriptor: modal });
    void removePromise.then(() => void modals.delete(modalComponent));
  };

  return {
    modals,
    openModal,
    callForModalDismiss,
    isModalOpened: isSimilarModalAlreadyOpened,
    isModalOpenedExact: isThisExactModalOpened,
    scheduleModalRemoving,
    onOpen: openEvent.on,
    onDismiss: dismissEvent.on,
  } as const;
});
