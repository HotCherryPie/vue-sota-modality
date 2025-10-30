import { tryOnScopeDispose, useScrollLock, isClient } from '@vueuse/core';
import { computed, ref, watchEffect, type WritableComputedRef } from 'vue';

const counter = ref(0);
const controller = useScrollLock(isClient ? document.body : undefined);

watchEffect(() => {
  controller.value = counter.value > 0;
});

export const useBodyScrollLock = (
  initialState = false,
): WritableComputedRef<boolean> => {
  let enabled = initialState;

  if (enabled) counter.value += 1;

  tryOnScopeDispose(() => {
    if (enabled) counter.value -= 1;
  });

  return computed({
    get: () => controller.value,
    set: (v: boolean) => {
      if (v === enabled) return;
      enabled = v;
      counter.value += v ? 1 : -1;
    },
  });
};
