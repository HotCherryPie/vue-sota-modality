import { tryOnScopeDispose, watchOnce } from '@vueuse/core';
import type { If, IsNever } from 'type-fest';
import type { Component, MaybeRefOrGetter } from 'vue';
import { computed, toRef, watch } from 'vue';

import { useCurrentUrl } from '../../../utils';

import type {
  InferDataTypeFromModalComponent,
  InferValueTypeFromModalComponent,
  ModalDismissAction,
} from './modal-layout';
import { useModalLayout } from './modal-layout';
import type { ModalDismissSource } from './modal-layout/types';

type IfNever<T, TYes, TNo> = If<IsNever<T>, TYes, TNo>;
type IfUndefined<T, TYes, TNo> = undefined extends T ? TYes : TNo;

export interface UseModalOptions<TValue> {
  value?: MaybeRefOrGetter<TValue>;

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
}

export const useModal = <TComponent extends Component>(
  ModalComponent: TComponent,
  {
    value,
    dismissOnScopeDispose = true,
    dismissOnValueChange = true,
    dismissOnRouteChange = true,
  }: UseModalOptions<InferValueTypeFromModalComponent<TComponent>> = {},
) => {
  // eslint-disable-next-line sonar/pseudo-random -- it's ok
  const usageKey = Math.random().toString();

  type ModalValue = InferValueTypeFromModalComponent<TComponent>;
  type ModalData = InferDataTypeFromModalComponent<TComponent>;
  type OpenFunctionArguments = IfNever<
    ModalData,
    [],
    IfUndefined<ModalData, [data?: ModalData], [data: ModalData]>
  >;

  const location = useCurrentUrl();
  const { openModal, dismissModal, isModalOpened, isModalOpenedExact } =
    useModalLayout();
  const valueRef = toRef(value);

  // For internal usage.
  const dismiss_ = (action: ModalDismissAction) => {
    dismissModal(ModalComponent, action);
  };

  // For public usage.
  const dismiss = (
    intent: ModalDismissAction.Intent,
    description?: ModalDismissSource.Description,
  ) => {
    dismiss_({
      intent,
      source: { origin: 'external', input: 'unknown', description },
    });
  };

  const open = (...[data]: OpenFunctionArguments) => {
    if (dismissOnValueChange) {
      watchOnce(
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
      () => location.value.pathname,
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
