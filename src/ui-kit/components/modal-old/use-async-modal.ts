import type { AsyncComponentLoader, Component } from 'vue';

import { useAsyncComponent } from '../../../utils';
import type { MaybeReadonlyRefOrGetter } from '../../../utils';

import type { InferValueTypeFromModalComponent } from './modal-layout';
import { useModal } from './use-modal';
import type { UseModalOptions } from './use-modal';

export interface UseAsyncModalOptions<TValue> extends UseModalOptions<TValue> {
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
