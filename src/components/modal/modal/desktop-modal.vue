<script setup lang="ts">
import { watchOnce } from '@vueuse/core';
import { computed, nextTick, useTemplateRef } from 'vue';

import { useIsRendered } from '../../../utils';
import type {
  ModalDismissActionIntent,
  ModalDismissSourceDescription,
} from '../modal-layout/types';

const OPEN_DURATION = 300;
const CLOSE_DURATION = 200;

interface Props {
  active: boolean;
  dismissed: boolean;
  preopened: boolean;
  detent: 'auto' | 'expanded';
  size: 'small' | 'large';
  scrollable: boolean;
}

interface Emits {
  closed: [];
  dismiss: [
    intent: ModalDismissActionIntent,
    description: ModalDismissSourceDescription,
  ];
}

interface Slots {
  default: (props: {
    dismiss: (
      intent: ModalDismissActionIntent,
      description?: ModalDismissSourceDescription,
    ) => void;
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

const dismiss = (
  intent: ModalDismissActionIntent,
  description?: ModalDismissSourceDescription,
) => void emit('dismiss', intent, description);

// Do not use onanimationend/ontransitionend events because of inconsistency
//  in cases of same-frame transition switch!
watchOnce(
  () => props.dismissed,
  async () => {
    await nextTick();
    await Promise.all(
      modalRef.value?.getAnimations().map((it) => it.finished) ?? [],
    );
    emit('closed');
  },
);
</script>

<template>
  <div :class="$style.root" :inert="!active">
    <div
      :class="[$style.backdrop, isOpen && $style.open]"
      @click="$emit('dismiss', 'cancel', 'backdrop')"
    />

    <div
      ref="modal"
      :class="[
        $style.card,
        isOpen && $style.open,
        $style[`detent-${detent}`],
        $style[`size-${size}`],
        scrollable && $style.scrollable,
      ]"
    >
      <slot :dismiss="dismiss" />
    </div>
  </div>
</template>

<style lang="postcss" module>
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
    @add-mixin hide-scroll;

    overflow: hidden auto;
    overscroll-behavior: contain;
  }

  &.detent-auto {
    height: auto;
  }

  &.detent-expanded {
    height: 100%; /* Will be clipped by max-height */
  }

  &.size-small {
    max-width: var(--size-modal-desktop-width-s);
  }

  &.size-large {
    max-width: var(--size-modal-desktop-width-m);
  }
}
</style>
