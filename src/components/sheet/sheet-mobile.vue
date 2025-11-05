<script setup lang="ts">
import { watchOnce } from '@vueuse/core';
import { computed, nextTick, useTemplateRef } from 'vue';

import type { ModalityLayout } from '../../ui-kit';
import { useIsRendered } from '../../utils';

const OPEN_DURATION = 1000; // 300
const CLOSE_DURATION = 2000; // 200

interface Props {
  dismissed: boolean;
  preopened: boolean;
  detent: 'auto' | 'expanded' | undefined;
  scrollable: boolean | undefined;
}

interface Emits {
  closed: [];
  requestDismiss: [action: ModalityLayout.Types.Child.DismissAction];
}

interface Slots {
  default: (props: {
    dismiss: (action: ModalityLayout.Types.Child.DismissAction) => void;
    requestDismiss: (action: ModalityLayout.Types.Child.DismissAction) => void;
  }) => unknown;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
defineSlots<Slots>();

// Why not just `isMounted`? To "play" open animation,
//  we should switch styles for "closed" and "opened" state.
//  If we do this during `onMounted` everything will work fine...
//  Except in Firefox. Firefox doesn't take into account changes
//  made before first rasterization.
const isRendered = useIsRendered();

const modalRef = useTemplateRef('modal');

const isOpen = computed(
  () => (props.preopened || isRendered.value) && !props.dismissed,
);

const dismiss = (action: ModalityLayout.Types.Child.DismissAction) =>
  void emit('requestDismiss', action);
const requestDismiss = (action: ModalityLayout.Types.Child.DismissAction) =>
  void emit('requestDismiss', action);

// Do not use onanimationend/ontransitionend events because of inconsistency
//  in cases of same-frame transition switch!
watchOnce(
  () => props.dismissed,
  async () => {
    await nextTick();
    const animations =
      modalRef.value?.getAnimations().map((it) => it.finished) ?? [];
    await Promise.all(animations);
    emit('closed');
  },
);

const backdropClickDismissAction: ModalityLayout.Types.Child.DismissAction = {
  intent: 'cancel',
  source: { origin: 'user', input: 'ui', description: 'backdrop click' },
};
</script>

<template>
  <div :class="$style.root">
    <div
      :class="[$style.backdrop, isOpen && $style.open]"
      @click="dismiss(backdropClickDismissAction)"
    />

    <div
      ref="modal"
      :class="[
        $style.card,
        isOpen && $style.open,
        $style[`detent-${detent}`],
        scrollable && $style.scrollable,
      ]"
    >
      <slot :dismiss :requestDismiss />
    </div>
  </div>
</template>

<style module>
.root {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  inset: 0;
}

.backdrop {
  position: fixed;
  background-color: var(--color-background-base-alfa-scrim);
  inset: 0;
  transition-duration: calc(v-bind(OPEN_DURATION) * 1ms);
  transition-property: opacity;

  &:not(.open) {
    opacity: 0;
    transition-duration: calc(v-bind(CLOSE_DURATION) * 1ms);
  }
}

.card {
  position: fixed;
  display: flex;
  width: 100%;
  max-width: var(--size-modal-desktop-width-s);
  max-height: min(
    calc(100% - var(--modal-margin-desktop) * 2),
    var(--size-modal-desktop-height-max)
  );
  flex: 0 0 auto;
  flex-direction: column;
  border-radius: var(--rounding-modal-m);
  background-color: var(--modal-color-bg);
  transition-duration: calc(v-bind(OPEN_DURATION) * 1ms);
  transition-property: opacity, transform;

  > * {
    flex: 0 0 auto;
  }

  &:not(.open) {
    opacity: 0;
    transform: translateY(20px);
    transition-duration: calc(v-bind(CLOSE_DURATION) * 1ms);
  }

  &.scrollable {
    scrollbar-width: thin;
    overflow: hidden auto;
  }

  &.detent-auto {
    height: auto;
  }

  &.detent-expanded {
    height: 100%; /* Will be clipped by max-height */
  }
}
</style>
