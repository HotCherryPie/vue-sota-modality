<script setup lang="ts">
import { computed, watch } from 'vue';
import type { Component } from 'vue';

import { noop } from '../../../utils';

import { RichCloseEvent } from './events';
import { ModalLayoutChildContext } from './modal-layout-child-context';
import type {
  ModalDismissAction,
  ModalLayoutChildCloseEventPayload,
  ModalViewDescriptor,
} from './types';
import { useModalLayoutInternalState } from './use-modal-layout-internal-state';

export interface ModalOpenEvent {
  name: string | undefined;
  time: number;
}

export interface ModalDismissEvent {
  name: string | undefined;
  time: number;
  action: ModalDismissAction;
}

export interface ModalMountedEvent {
  name: string | undefined;

  /** Time in milliseconds between mount and `open()` call */
  wait: number;
}

export interface ModalUnmountedEvent {
  name: string | undefined;

  /** Time in milliseconds between `dismiss()` call and unmount */
  wait: number;
}

interface Emits {
  modalOpen: [ModalOpenEvent];
  modalDismiss: [ModalDismissEvent];
  modalMounted: [ModalMountedEvent];
  modalUnmounted: [ModalUnmountedEvent];
  presenceChange: [someModalsAreOpen: boolean];
}

const emit = defineEmits<Emits>();

const state = useModalLayoutInternalState();

state.onOpen(
  ({ component, descriptor }) =>
    void emit('modalOpen', {
      name: resolveModalName(component),
      time: descriptor.calledAt,
    }),
);

state.onDismiss(
  ({ component, descriptor }) =>
    void emit('modalDismiss', {
      name: resolveModalName(component),
      // eslint-disable-next-line ts/no-non-null-assertion -- guaranteed here
      time: descriptor.dismissedAt!,
      // eslint-disable-next-line ts/no-non-null-assertion -- guaranteed here
      action: descriptor.requestedDismissAction.value!,
    }),
);

const list = computed(() => [...state.modals.entries()]);

// Modal is active if it is first non-dismissed from right
const isModalActive = (index: number) =>
  index === list.value.findLastIndex((it) => !it[1].isDismissed.value);

const handleClose = (
  component: Component,
  event: ModalLayoutChildCloseEventPayload,
) => {
  let promise: Promise<void> | undefined;
  let action: ModalDismissAction = {
    intent: 'cancel',
    source: { origin: 'unknown', input: 'unknown', description: undefined },
  };

  if (event instanceof Promise) promise = event.then(noop);
  else if (event instanceof RichCloseEvent)
    promise = event.promise?.then(noop) ?? promise;
  else if (event instanceof CustomEvent && event.detail instanceof Promise)
    promise = event.detail.then(noop);

  if (event instanceof RichCloseEvent) action = event.action;

  state.scheduleModalRemoving(component, promise ?? Promise.resolve(), action);
};

watch(
  () => list.value.length > 0,
  (someModalsAreOpen) => {
    emit('presenceChange', someModalsAreOpen);
  },
);

const resolveModalName = (it: Component) =>
  it.name === 'AsyncComponentWrapper' ?
    // @ts-expect-error it is what it is
    it.__asyncResolved?.analyticName
    // @ts-expect-error it is what it is
  : it.analyticName;

const handleModalMount = (
  component: Component,
  descriptor: ModalViewDescriptor,
) => {
  emit('modalMounted', {
    name: resolveModalName(component),
    wait: performance.now() - descriptor.calledAt,
  });
};

const handleModalUnmounted = (
  component: Component,
  descriptor: ModalViewDescriptor,
) => {
  emit('modalUnmounted', {
    name: resolveModalName(component),

    // There is a possible situation where modal can be unmounted without
    //  `dismiss()` call. So we handle this case as `wait: -1`
    wait:
      descriptor.dismissedAt === undefined ?
        -1
      : performance.now() - descriptor.dismissedAt,
  });
};
</script>

<template>
  <div :class="$style.wrapper">
    <template v-for="([component, descriptor], index) of list" :key="component">
      <ModalLayoutChildContext :descriptor :active="isModalActive(index)">
        <Suspense>
          <component
            :is="component"
            :active="isModalActive(index)"
            :data="descriptor.data"
            :modelValue="descriptor.value.value"
            :requestedDismissAction="descriptor.requestedDismissAction.value"
            @update:modelValue="descriptor.value.value = $event"
            @cancel.stop
            @close.stop="handleClose(component, $event)"
            @vue:mounted="handleModalMount(component, descriptor)"
            @vue:beforeUnmount="handleModalUnmounted(component, descriptor)"
          />
        </Suspense>
      </ModalLayoutChildContext>
    </template>
  </div>
</template>

<style module>
.wrapper {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  contain: size;
}
</style>
