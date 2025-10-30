import { ref, toRef } from 'vue';

const href = ref(globalThis.window?.location.href);

const update = () => {
  if (href.value !== globalThis.window?.location.href)
    href.value = globalThis.window?.location.href;
};

let initialized = false;

/**
 * @warn EXPERIMENTAL! Do not use it for now!
 */
export const useLocationUnsafe = () => {
  if (!initialized) {
    initialized = true;

    const oldPushState = globalThis.window?.history.pushState;
    (globalThis.window ?? {}).history.pushState = function pushState(...args) {
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      const result = Reflect.apply(oldPushState, this, args);

      update();

      return result;
    };

    const oldReplaceState = globalThis.window?.history.replaceState;
    (globalThis.window ?? {}).history.replaceState = function replaceState(
      ...args
    ) {
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      const result = Reflect.apply(oldReplaceState, this, args);

      update();

      return result;
    };

    globalThis.window?.addEventListener('popstate', () => {
      update();
    });
  }

  return toRef(() => new URL(href.value));
};
