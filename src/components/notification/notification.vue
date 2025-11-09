<script setup lang="ts">
import { useMediaQuery, watchOnce } from '@vueuse/core';
import { nextTick, toRef, useTemplateRef } from 'vue';

import { useModalExtras } from '../../hooks';
import type { ModalityLayout } from '../../ui-kit';

const isMobile = useMediaQuery('(width < 1024px)');
const holderRef = useTemplateRef('holder');
const state = useModalExtras({ defferClose: true });

const clickDismissAction: ModalityLayout.Types.Child.DismissAction = {
  intent: 'cancel',
  source: {
    origin: 'user',
    input: 'ui',
    description: '<sheet-desktop> backdrop click',
  },
};

const isDismissed = toRef(() => state.context.descriptor.isDismissed);
const isOutnumbered = toRef(() => (state.context.stackIndex.value ?? 0) > 5);

// Do not use onanimationend/ontransitionend events because of inconsistency
//  in cases of same-frame transition switch!
watchOnce(isDismissed, async () => {
  await nextTick();
  const animations =
    holderRef.value?.getAnimations().map((it) => it.finished) ?? [];
  await Promise.all(animations);
  state.commitClosedState();
});
</script>

<template>
  <div
    ref="holder"
    :inert="isDismissed"
    :class="[
      $style.holder,
      isMobile && $style.mobile,
      isDismissed && $style.dismissed,
      isOutnumbered && $style.outnumbered,
    ]"
  >
    <div :class="$style.root" @click="state.dismiss(clickDismissAction)"></div>
  </div>
</template>

<style lang="css" module>
.holder {
  --padding-inline-start: max(env(safe-area-inset-left), 4px);
  --padding-inline-end: max(env(safe-area-inset-right), 4px);

  &:dir(rtl) {
    --padding-inline-start: max(env(safe-area-inset-right), 4px);
    --padding-inline-end: max(env(safe-area-inset-left), 4px);
  }

  position: relative;
  interpolate-size: allow-keywords;
  transition-property: height, transform;
  transition-duration: 300ms;
  padding-inline: var(--padding-inline-start) var(--padding-inline-end);
  height: calc-size(max-content, size);
}

.holder.mobile {
  width: 100%;

  &:first-child {
    padding-block-start: max(env(safe-area-inset-top), 8px);
  }

  @starting-style {
    transform: translateY(-100%);
  }

  &.dismissed {
    transition-duration: 200ms;
    transform: scale(0);
    height: 0;
  }
}

.holder:not(.mobile) {
  width: 200px;

  &:first-child {
    padding-block-start: 4px;
  }

  @starting-style {
    transform: translateX(100%);
    height: 0;
  }

  /* `:where` to lower specificity */
  &:where(:not(:last-child):not(:hover)) {
    height: 24px;
  }

  &.outnumbered {
    height: 0;
  }

  &.dismissed {
    transition-duration: 200ms;
    transform: translateX(100%);
    height: 0;
  }
}

.root {
  height: 60px;
  background-color: #ffffffeb;
  border-radius: 20px;
  box-shadow:
    0px 3px 10px #0000001f,
    0px 0px 0px rgba(3, 7, 18, 0.01),
    0px 1px 1px rgba(3, 7, 18, 0.01),
    0px 2px 3px rgba(3, 7, 18, 0.02),
    0px 3px 5px rgba(3, 7, 18, 0.02),
    0px 5px 8px rgba(3, 7, 18, 0.03);
  /*  */

  backdrop-filter: blur(10px);
}
</style>
