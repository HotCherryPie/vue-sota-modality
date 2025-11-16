import { computed, ref } from 'vue';

const href = ref(globalThis.window.location.href);
const url = computed(() => new URL(href.value));

const update = () => {
  if (href.value !== globalThis.window.location.href)
    href.value = globalThis.window.location.href;
};

let initialized = false;

const useHistoryApi = () => {
  if (initialized) return;

  initialized = true;

  // eslint-disable-next-line ts/unbound-method -- it's ok
  const oldPushState = globalThis.window.history.pushState;
  globalThis.window.history.pushState = function pushState(...arguments_) {
    // eslint-disable-next-line ts/no-confusing-void-expression
    const result = Reflect.apply(oldPushState, this, arguments_);
    update();
    return result;
  };

  // eslint-disable-next-line ts/unbound-method -- it's ok
  const oldReplaceState = globalThis.window.history.replaceState;
  globalThis.window.history.replaceState = function replaceState(
    ...arguments_
  ) {
    // eslint-disable-next-line ts/no-confusing-void-expression
    const result = Reflect.apply(oldReplaceState, this, arguments_);
    update();
    return result;
  };

  globalThis.window.addEventListener('popstate', () => void update());
};

const useNavigationApi = () => {
  if (initialized) return;
  /* eslint-disable */
  (globalThis.window as any).navigation.addEventListener(
    'currententrychange',
    // 'navigatesuccess',
    () => void update(),
  );
  /* eslint-enable */
};

export const useCurrentUrl = () => {
  if ('navigation' in globalThis.window) useNavigationApi();
  else useHistoryApi();

  return url;
};
