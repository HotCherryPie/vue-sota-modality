import { tryOnScopeDispose, watchOnce } from '@vueuse/core';
import type { If, IsNever } from 'type-fest';
import { computed, isRef, shallowRef, watch } from 'vue';
import type { ShallowRef } from 'vue';

import { useModalityLayoutApi } from '../../ui-kit';
import type { ModalityLayout } from '../../ui-kit';
import { useCurrentUrl } from '../../utils';

type IfNever<T, TYes, TNo> = If<IsNever<T>, TYes, TNo>;
type IfUndefined<T, TYes, TNo> = undefined extends T ? TYes : TNo;

type UseModalOptionsValue<TValue> = IfUndefined<
  TValue,
  { value?: TValue | ShallowRef<TValue> },
  { value: TValue | ShallowRef<TValue> }
>;

interface UseModalOptionsDefault {
  // MaybeRefOrGetter doesn't actually make sense here.
  // value: TValue | ShallowRef<TValue>;

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

type UseModalOptions<TValue> = UseModalOptionsDefault
  & UseModalOptionsValue<TValue>;

const externalCancelDismissAction = {
  intent: 'cancel',
  source: { origin: 'external', input: 'unknown', description: undefined },
} satisfies ModalityLayout.Types.Child.DismissAction;

const externalResolveDismissAction = {
  intent: 'resolve',
  source: { origin: 'external', input: 'unknown', description: undefined },
} satisfies ModalityLayout.Types.Child.DismissAction;

type UseModalArguments<TData, TValue> = IfUndefined<
  TValue,
  [
    component: ModalityLayout.Types.Child<TData, TValue>,
    options?: UseModalOptions<NoInfer<TValue>>,
  ],
  [
    component: ModalityLayout.Types.Child<TData, TValue>,
    options: UseModalOptions<NoInfer<TValue>>,
  ]
>;

export const useModal = <TData, TValue>(
  ...[component, options]: UseModalArguments<TData, TValue>
) => {
  const {
    value,
    dismissOnScopeDispose = true,
    dismissOnValueChange = true,
    dismissOnRouteChange = true,
  } = options ?? {};

  let key: ModalityLayout.Types.Child.Descriptor.Key | undefined;
  // eslint-disable-next-line ts/no-unsafe-type-assertion
  const valueRef = (
    isRef(value) ? value : shallowRef(value)) as ShallowRef<TValue>;

  const api = useModalityLayoutApi();
  const location = useCurrentUrl();

  if (api === undefined)
    throw new Error('<ModalityLayout> is missing in current scope!');

  const isOpened = computed(() => api.isOpen(key));
  const isOpenedSimilar = computed(() => api.isOpenSimilar(component));

  // For internal usage.
  const dismiss_ = (action: ModalityLayout.Types.Child.DismissAction) => {
    if (key !== undefined && isOpened.value) api.dismissChild(key, action);
  };

  // For public usage.
  const dismiss = (
    intent: ModalityLayout.Types.Child.DismissAction.Intent = 'cancel',
    description:
      | ModalityLayout.Types.Child.DismissSource.Description
      | undefined,
  ) => {
    if (key === undefined) {
      if (import.meta.env.DEV)
        console.warn(
          '[useModal] You try to dismiss child which is not open yet!',
        );
      return;
    }

    api.dismissChild(key, {
      intent,
      source: { origin: 'external', input: 'unknown', description },
    });
  };

  type OpenFunctionArguments = IfNever<
    TData,
    [],
    IfUndefined<TData, [data?: TData], [data: TData]>
  >;

  const open = (...[data]: OpenFunctionArguments) => {
    if (api.isOpen(key)) {
      if (import.meta.env.DEV)
        console.warn('[useModal] This modal is already opened!');
      return;
    }

    if (api.isOpenSimilar(component)) {
      if (import.meta.env.DEV)
        console.warn('[useModal] Similar modal is already opened!');
      return;
    }

    if (dismissOnValueChange)
      watchOnce(valueRef, () => void dismiss_(externalResolveDismissAction));

    // eslint-disable-next-line ts/no-non-null-assertion
    const handle = api.openChild(component, data!, valueRef);
    key = handle?.key;

    return handle?.resolutionPromise;
  };

  if (dismissOnScopeDispose)
    tryOnScopeDispose(() => void dismiss_(externalCancelDismissAction));

  if (dismissOnRouteChange)
    watch(
      () => location.value.pathname,
      () => void dismiss_(externalCancelDismissAction),
    );

  return {
    open,
    dismiss,
    isOpened,
    isOpenedSimilar,
  };
};
