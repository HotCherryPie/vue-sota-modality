<script setup lang="ts">
import { useElementSize, watchOnce } from '@vueuse/core';
import { computed, nextTick, reactive, useTemplateRef } from 'vue';

import type {
  ModalDismissActionIntent,
  ModalDismissSourceDescription,
} from '../modal-layout/types';
import { useIsRendered } from '../../../utils';

// Most properties taken from Flutter material modals
const CLOSING_DURATION = 200;
const PLACING_DURATION = 300;
const PLACING_EASING = 'cubic-bezier(0, 0, 0.25, 1)';
const CLOSING_EASING = 'cubic-bezier(0.3, 0, 0.4, 1)';
const BACKDROP_NATURAL_OPACITY = 1;

interface Props {
  active: boolean;
  dismissed: boolean;
  preopened: boolean;
  detent: 'auto' | 'expanded';
  scrollable: boolean;
  background?: string;
  fixedWidth?: boolean;
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
const modalHeight = useElementSize(modalRef).height;

const isOpen = computed(
  () => (props.preopened || isRendered.value) && !props.dismissed,
);

const modalAndBackdropCommonStyle = {
  'transition-duration': computed(
    () => `${props.dismissed ? CLOSING_DURATION : PLACING_DURATION}ms`,
  ),
  'transition-timing-function': computed(() =>
    props.dismissed ? CLOSING_EASING : PLACING_EASING,
  ),
};

const cardStyle = reactive({
  ...modalAndBackdropCommonStyle,
  transform: computed(() => (isOpen.value ? undefined : 'translateY(100%)')),
});

const backdropStyle = reactive({
  ...modalAndBackdropCommonStyle,
  opacity: computed(() => (isOpen.value ? BACKDROP_NATURAL_OPACITY : 0)),
});

const dismiss = (
  intent: ModalDismissActionIntent,
  description?: ModalDismissSourceDescription,
) => void emit('dismiss', intent, description);
const scrollTo: Element['scrollTo'] = (...args: any) =>
  modalRef.value?.scrollTo(...args);

// Do not use onanimationend/ontransitionend events because of inconsistency
//  in cases of same-frame transition switch!
watchOnce(
  () => props.dismissed,
  async () => {
    await nextTick();
    await Promise.all(
      modalRef.value?.getAnimations().map(it => it.finished) ?? [],
    );
    emit('closed');
  },
);

defineExpose({
  scrollTo,
});
</script>

<template>
  <div :class="$style.root" :inert="!active">
    <div
      :class="$style.backdrop"
      :style="backdropStyle"
      @click="dismiss('cancel', 'backdrop')"
    />

    <div
      ref="modal"
      :style="cardStyle"
      :class="[
        $style.modal,
        $style[`detent-${detent}`],
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
  flex-direction: column-reverse;
}

.backdrop {
  position: fixed;
  z-index: -1;

  /* Negative offsets here compensate possible viewport height changes
   *  when navbar resizes or something similar.
   */
  top: -200px;
  right: 0;
  bottom: -200px;
  left: 0;
  background-color: var(--color-background-base-alfa-scrim);
  transition-property: opacity;
  will-change: opacity;
}

.modal {
  position: fixed;
  display: flex;
  width: 100vw;
  max-height: calc(
    100% - max(var(--safe-area-inset-block-start), var(--modal-margin-mobile))
  ); /* `100%` here should act same as `100dvh` */

  flex: 0 0 auto;
  flex-direction: column;
  border-radius: var(--rounding-modal-m) var(--rounding-modal-m) 0 0;
  background-color: var(--modal-color-bg);

  /* This shadow acts as "Pinafore". Not the best solution (because is case of very small modals (~100px)
   *  shadow is not big enough), but easiest.
   */
  box-shadow: 0 calc(v-bind(modalHeight) * 1px - var(--rounding-modal-m)) 0
    var(--modal-color-bg);
  contain: layout; /* Not necessary, but PERFORMANCE!!! */
  padding-block-end: var(--safe-area-inset-block-end);
  transition-property: transform;
  will-change: transform;

  > * {
    flex: 0 0 auto;
  }

  &.scrollable {
    @add-mixin hide-scroll;

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
