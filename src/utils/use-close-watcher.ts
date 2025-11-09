import { onScopeDispose, toValue, watchEffect } from 'vue';

import { cloneEvent } from './common';
import { CloseWatcher } from './polyfills/close-watcher';
import type { CloseWatcherEventMap } from './polyfills/close-watcher';
import type { MaybeReadonlyRefOrGetter } from './types';

interface Options {
  /**
   * @default true
   */
  enabled?: MaybeReadonlyRefOrGetter<boolean | undefined>;

  onClose?: ((event: CloseWatcherEventMap['close']) => void) | undefined;
  onCancel?: ((event: CloseWatcherEventMap['cancel']) => void) | undefined;

  /**
   * Bypass "close-trapping" prevention logic.
   * {@link https://html.spec.whatwg.org/#example-CloseWatcher-cancel | More here}:
   * > For abuse prevention purposes, this event is only cancelable if the page
   * > has history-action activation, which will be lost after any given close
   * > request. This ensures that if the user sends a close request twice in a
   * > row without any intervening user activation, the request definitely
   * > succeeds; the second request ignores any cancel event handler's attempt
   * > to call preventDefault() and proceeds to close the CloseWatcher.
   *
   * @default false
   */
  abusive?: boolean | undefined;
}

export const useCloseWatcher = (options: Options) => {
  let watcher: InstanceType<typeof CloseWatcher> | undefined;

  const onClose = (event: CloseWatcherEventMap['close']) => {
    options.onClose?.(event);

    if (options.abusive) {
      watcher?.destroy();
      init();
    }
  };

  const onCancel = (event_: CloseWatcherEventMap['cancel']) => {
    const event =
      options.abusive ? cloneEvent(event_, { cancelable: true }) : event_;

    options.onCancel?.(event);

    if (options.abusive) {
      watcher?.destroy();
      init();
    }
  };

  const init = () => {
    watcher = new CloseWatcher();
    watcher.addEventListener('close', onClose);
    watcher.addEventListener('cancel', onCancel);
  };

  watchEffect(() => {
    if (toValue(options.enabled) === true) init();
    else watcher?.destroy();
  });

  onScopeDispose(() => void watcher?.destroy());

  return {
    destroy: () => void watcher?.destroy(),
    requestClose: () => void watcher?.requestClose(),
    close: () => void watcher?.close(),
  } as const;
};
