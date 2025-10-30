import { whenever } from '@vueuse/core';
import type {
  AsyncComponentLoader,
  AsyncComponentOptions,
  Component,
  ComponentOptionsMixin,
} from 'vue';
import { defineAsyncComponent, ref, toValue } from 'vue';

import type { MaybeReadonlyRefOrGetter } from './types';

/**
 * Main reasons for this helper is ability to prefetch async component and be able to track fetch state
 * @param source same type as for `defineAsyncComponent`
 * @param options.retries number of prefetch/fetch retries
 * @param options.prefetch whether component should be prefetched
 */
export function useAsyncComponent<TComponent extends Component>(
  source: AsyncComponentLoader<TComponent> | AsyncComponentOptions<TComponent>,
  {
    retries = Infinity,
    prefetch = true,
  }: {
    retries?: number | undefined;
    prefetch?: MaybeReadonlyRefOrGetter<boolean | undefined>;
  } = {},
) {
  const isLoading = ref(false);
  const isLoaded = ref(false);
  const asyncComponentWrapperIsMounted = ref(false);

  const {
    loader,
    // eslint-disable-next-line unicorn/no-useless-undefined
    onError = undefined,
    ...restAsyncComponentOptions
  } = typeof source === 'function' ? { loader: source } : source;

  async function patchedLoader() {
    isLoading.value = true;
    try {
      const result = await loader();
      isLoaded.value = true;
      return result;
    } finally {
      isLoading.value = false;
    }
  }

  function patchedOnError(
    ...[error, retry, reject, attempt]: Parameters<NonNullable<typeof onError>>
  ) {
    if (onError) return onError(error, retry, reject, attempt);

    return attempt < retries ? void retry() : void reject();
  }

  const AsyncComponentWrapper = defineAsyncComponent({
    loader: patchedLoader,
    onError: patchedOnError,
    ...restAsyncComponentOptions,
  });

  (AsyncComponentWrapper as any).mixins = [
    ...((AsyncComponentWrapper as any).mixins ?? []),
    {
      mounted() {
        asyncComponentWrapperIsMounted.value = true;
      },
      unmounted() {
        asyncComponentWrapperIsMounted.value = false;
      },
    } satisfies ComponentOptionsMixin,
  ];

  whenever(
    () => toValue(prefetch),
    () => {
      if ('__asyncLoader' in AsyncComponentWrapper) {
        // Yeah, usage of undocumented internal api, bla bla bla. But this code is fail-safe (!)
        //  and can be easily (not so in fact, but still) refactored (you should call `loader` by yourself,
        //  and `patchedLoader` should return promise (or already fetched component) returned by `loader`.
        //  Calling just `loader` ahead of time wouldn't help, because when `loader` will be called by vue it
        //  will fetch component again, so you need to cache result by yourself. And you also need to implement
        //  same error handling process as vue does). But this way is easier, and just one line of code!
        //  In worst case - prefetch wouldn't work which is not a big tragedy
        AsyncComponentWrapper['__asyncLoader']();
      } else if (import.meta.env.DEV) {
        console.error(
          '__asyncLoader in missing in AsyncComponentWrapper!' +
            ' Shame on the author! Tell him to refactor this on his weekend!',
        );
      }
    },
    { once: true, immediate: true },
  );

  return [
    AsyncComponentWrapper,
    {
      asyncComponentWrapperIsMounted,
      isLoading,
      isLoaded,
    },
  ] as const;
}
