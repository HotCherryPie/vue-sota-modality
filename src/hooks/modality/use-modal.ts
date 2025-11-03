import { tryOnScopeDispose, watchOnce } from '@vueuse/core';
import type { If, IsNever } from 'type-fest';
import { computed, toRef, watch } from 'vue';
import type { Ref } from 'vue';

import { useModalityLayoutApi } from '../../ui-kit';
import type { ModalityLayout } from '../../ui-kit';
import { useCurrentUrl } from '../../utils';

type IfNever<T, TYes, TNo> = If<IsNever<T>, TYes, TNo>;
type IfUndefined<T, TYes, TNo> = undefined extends T ? TYes : TNo;

export interface UseModalOptions<TValue> {
  // MaybeRefOrGetter doesn't actually make sense here.
  value?: Ref<TValue>;

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

export const useModal = <TComponent extends ModalityLayout.Types.Child>(
  component: TComponent,
  options: UseModalOptions<
    ModalityLayout.Types.Child.InferValueType<TComponent>
  > = {},
) => {
  const {
    value,
    dismissOnScopeDispose = true,
    dismissOnValueChange = true,
    dismissOnRouteChange = true,
  } = options;

  // eslint-disable-next-line sonar/pseudo-random -- it's ok
  const usageKey = Math.random().toString();
  const valueRef = toRef(value);

  const api = useModalityLayoutApi();
  const location = useCurrentUrl();

  if (api === undefined)
    throw new Error('<ModalityLayout> is missing in current scope!');

  const isOpened = computed(() => api.isOpen(usageKey));
  const isOpenedSimilar = computed(() => api.isOpenSimilar(component));

  // For internal usage.
  const dismiss_ = (action: ModalityLayout.Types.Child.DismissAction) => {
    api.dismissChild(usageKey, action);
  };

  // For public usage.
  const dismiss = (
    intent: ModalityLayout.Types.Child.DismissAction.Intent,
    description?: ModalityLayout.Types.Child.DismissSource.Description,
  ) => {
    dismiss_({
      intent,
      source: { origin: 'external', input: 'unknown', description },
    });
  };

  type ModalData = ModalityLayout.Types.Child.InferValueType<TComponent>;
  type OpenFunctionArguments = IfNever<
    ModalData,
    [],
    IfUndefined<ModalData, [data?: ModalData], [data: ModalData]>
  >;

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

    return api.openChild(component, usageKey, data, valueRef);
  };

  if (dismissOnScopeDispose)
    tryOnScopeDispose(() => {
      if (isOpened.value)
        dismiss_({
          intent: 'cancel',
          source: {
            origin: 'external',
            input: 'unknown',
            description: undefined,
          },
        });
    });

  if (dismissOnRouteChange)
    watch(
      () => location.value.pathname,
      () => {
        if (isOpened.value)
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

  return {
    open,
    dismiss,
    isOpened,
    isOpenedSimilar,
  };
};
