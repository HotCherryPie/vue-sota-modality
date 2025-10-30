import type { AsyncComponentLoader, Component } from 'vue';

import { useAsyncComponent, type MaybeReadonlyRefOrGetter } from '../../utils';

import type { InferValueTypeFromModalComponent } from './modal-layout';
import { useModal, type UseModalOptions } from './use-modal';

export interface UseAsyncModalOptions<Value> extends UseModalOptions<Value> {
  /**
   * @default false
   */
  prefetch?: MaybeReadonlyRefOrGetter<boolean | undefined>;
}

export const useAsyncModal = <TComponent extends Component>(
  loader: AsyncComponentLoader<TComponent>,
  {
    prefetch,
    ...options
  }: UseAsyncModalOptions<InferValueTypeFromModalComponent<TComponent>>,
) => {
  const [Component, { isLoading, isLoaded }] = useAsyncComponent(loader, {
    prefetch,
  });

  return {
    ...useModal<TComponent>(Component, options),
    isLoading,
    isLoaded,
  };
};
