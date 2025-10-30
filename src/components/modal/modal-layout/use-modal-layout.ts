import type { Component, Ref } from 'vue';

import type { ModalDismissAction, ModalResolution } from './types';
import { useModalLayoutInternalState } from './use-modal-layout-internal-state';

/**
 * Public ModalLayout API
 */
export const useModalLayout = () => {
  const {
    openModal: openModalInternal,
    isModalOpened,
    isModalOpenedExact,
    callForModalDismiss,
  } = useModalLayoutInternalState();

  const openModal = <TModalValue>(modalComponent: Component, key: string, data: unknown, value: Ref) => {
    return openModalInternal(modalComponent, key, data, value) as Promise<ModalResolution<TModalValue>> | undefined;
  };

  const dismissModal = (modalComponent: Component, action: ModalDismissAction) => {
    callForModalDismiss(modalComponent, action);
  };

  return {
    openModal,
    dismissModal,
    isModalOpened,
    isModalOpenedExact,
  } as const;
};
