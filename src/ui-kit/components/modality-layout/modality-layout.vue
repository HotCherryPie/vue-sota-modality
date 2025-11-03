<script setup lang="ts">
import { inject, provide, watch, watchEffect } from 'vue';

import { INTERNAL_STATE_INJECTION_KEY, createState } from './modality-layout';
import type { Types } from './modality-layout';
import { ModalityLayoutChildContext } from './modality-layout-child-context';

const props = defineProps<Types.Props>();
const emit = defineEmits<Types.Emits>();
defineSlots<Types.Slots>();

const internalState =
  props.state ?? inject(INTERNAL_STATE_INJECTION_KEY) ?? createState();

provide(INTERNAL_STATE_INJECTION_KEY, internalState);

// TODO: watchSync & call on isDismissed change
// onDismiss: (descriptor) =>
//     void emit('modalDismiss', {
//       descriptor,
//       time: descriptor.dismissedAt,
//     }),

// TODO: watchSync & call on array change
// onOpen: (descriptor) =>
//   void emit('modalOpen', {
//     descriptor,
//     time: descriptor.calledAt,
//   }),

const handleChildMount = (
  descriptor: Types.Child.Descriptor<unknown, unknown>,
) => {
  emit('modalMounted', {
    descriptor,
    wait: performance.now() - descriptor.calledAt,
  });
};

const handleChildUnmounted = (
  descriptor: Types.Child.Descriptor<unknown, unknown>,
) => {
  emit('modalUnmounted', {
    descriptor,
    // There is a possible situation where modal can be unmounted without
    //  `dismiss()` call. So we handle this case as `wait: -1`
    wait:
      descriptor.dismissedAt === undefined ?
        -1
      : performance.now() - descriptor.dismissedAt,
  });
};

watch(
  () =>
    [
      internalState.children.size > 0,
      // TODO: remove `Iterator.from()` after fix
      //  https://github.com/vuejs/core/issues/12615
      Iterator.from(internalState.children.values()).some(
        (it) => !it.isDismissed,
      ),
    ] as const,
  ([someChildAreShown, someChildAreActive]) => {
    emit('presenceChange', { someChildAreShown, someChildAreActive });
  },
);

// Stack index exist only for active modals.
const getStackIndex = (index: number) => {
  // TODO: remove `Iterator.from()` after fix
  //  https://github.com/vuejs/core/issues/12615
  const child = Iterator.from(internalState.children.values()).toArray();

  // eslint-disable-next-line ts/no-non-null-assertion -- guaranteed here
  const modal = child.at(index)!;
  // eslint-disable-next-line unicorn/no-useless-undefined
  if (modal.isDismissed) return undefined;

  let stackIndex = 0;
  for (const it of child.toReversed()) {
    if (it === modal) break;
    stackIndex += it.isDismissed ? 0 : 1;
  }

  return stackIndex;
};

watchEffect(() => {
  console.log('internalState.children', [...internalState.children.values()]);
});
</script>

<template>
  <slot />

  <div :class="$attrs['class']">
    <template v-for="([key, descriptor], index) of internalState.children" :key>
      <ModalityLayoutChildContext
        :descriptor
        :stackIndex="getStackIndex(index)"
      >
        <Suspense>
          <component
            :is="descriptor.component"
            :data="descriptor.data"
            :stackIndex="getStackIndex(index)"
            :modelValue="descriptor.value.value"
            :requestedDismissAction="descriptor.requestedDismissAction"
            @update:modelValue="descriptor.value.value = $event"
            @vue:mounted="handleChildMount(descriptor)"
            @vue:beforeUnmount="handleChildUnmounted(descriptor)"
          />
        </Suspense>
      </ModalityLayoutChildContext>
    </template>
  </div>
</template>
