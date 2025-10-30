import { tryOnScopeDispose } from '@vueuse/core';
import type { If, IsNever } from 'type-fest';
import type { Component, MaybeRefOrGetter } from 'vue';
import { computed, toRef, toValue, watch } from 'vue';

type IfNever<T, TYes, TNo> = If<IsNever<T>, TYes, TNo>;
type IfUndefined<T, TYes, TNo> = undefined extends T ? TYes : TNo;

import type {
  InferDataTypeFromModalComponent,
  InferValueTypeFromModalComponent,
  ModalDismissAction,
  ModalDismissActionIntent,
} from './modal-layout';
import { useModalLayout } from './modal-layout';
import type { ModalDismissSourceDescription } from './modal-layout/types';
import { useLocationUnsafe } from '../../utils';

export interface UseModalOptions<Value> {
  value?: MaybeRefOrGetter<Value>;

  /**
   * @defaultValue `true`
   */
  dismissOnScopeDispose?: boolean;

  /**
   * @defaultValue `true`
   */
  dismissOnValueChange?: boolean;

  /**
   * @defaultValue `true`
   */
  dismissOnRouteChange?: boolean;

  /**
   * @defaultValue `true`
   */
  interruptFullscreenOnOpen?: boolean;
}

export const useModal = <TComponent extends Component>(
  ModalComponent: TComponent,
  {
    value,
    dismissOnScopeDispose = true,
    dismissOnValueChange = true,
    dismissOnRouteChange = true,
    interruptFullscreenOnOpen = true,
  }: UseModalOptions<InferValueTypeFromModalComponent<TComponent>> = {},
) => {
  const usageKey = Math.random().toString();

  type ModalValue = InferValueTypeFromModalComponent<TComponent>;
  type ModalData = InferDataTypeFromModalComponent<TComponent>;
  type OpenFunctionArguments = IfNever<
    ModalData,
    [],
    IfUndefined<ModalData, [data?: ModalData], [data: ModalData]>
  >;

  const location = useLocationUnsafe();
  const { openModal, dismissModal, isModalOpened, isModalOpenedExact } =
    useModalLayout();
  const valueRef = toRef(value);

  // For internal usage.
  const dismiss_ = (action: ModalDismissAction) => {
    dismissModal(ModalComponent, action);
  };

  // For public usage.
  const dismiss = (
    intent: ModalDismissActionIntent,
    description?: ModalDismissSourceDescription | undefined,
  ) => {
    dismiss_({
      intent,
      source: { origin: 'external', input: 'unknown', description },
    });
  };

  const open = (...[data]: OpenFunctionArguments) => {
    if (interruptFullscreenOnOpen && document.fullscreenElement)
      document.exitFullscreen?.();

    if (dismissOnValueChange) {
      watch(
        valueRef,
        () =>
          void dismiss_({
            intent: 'resolve',
            source: {
              origin: 'external',
              input: 'unknown',
              description: undefined,
            },
          }),
        {
          once: true,
        },
      );
    }

    return openModal<ModalValue>(ModalComponent, usageKey, data, valueRef);
  };

  const isOpened = computed(() => isModalOpened(ModalComponent));
  const isOpenedExact = computed(() => isModalOpenedExact(usageKey));

  if (dismissOnScopeDispose)
    tryOnScopeDispose(() => {
      if (isOpenedExact.value)
        dismiss_({
          intent: 'cancel',
          source: {
            origin: 'external',
            input: 'unknown',
            description: undefined,
          },
        });
    });

  if (dismissOnRouteChange) {
    watch(
      () => toValue(location.value.pathname),
      () => {
        if (isOpenedExact.value)
          dismiss_({
            intent: 'cancel',
            source: {
              origin: 'external',
              input: 'unknown',
              description: undefined,
            },
          });
      },
    );
  }

  return {
    open,
    dismiss,
    isOpened,
  } as const;
};
