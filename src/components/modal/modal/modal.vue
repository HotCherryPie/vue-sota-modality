<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';

import {
  useModalLayoutChildApi,
  type ModalDismissActionIntent,
  type RichCancelEvent,
  type RichCloseEvent,
} from '../modal-layout';
import type { ModalDismissSourceDescription } from '../modal-layout/types';

import DesktopModal from './desktop-modal.vue';
import MobileModal from './mobile-modal.vue';
import type { Props, Slots } from './types';
import { useMediaQuery } from '@vueuse/core';
import { useIsRendered } from '../../../utils';

// This events magically emitted by `useModalLayoutChildApi`
//  and here only for correct typings. This particular events
//  should be specified in `defineEmits` on with object syntax!
//  In this case we prevent vue from knowing about this events
//  in runtime and achieve correct types on component.
type FakeEmits = {
  close: (payload: RichCloseEvent) => true;
  cancel: (payload: RichCancelEvent) => true;
};

withDefaults(defineProps<Props>(), {
  detent: 'auto',
  scrollable: false,
  size: 'small',
});
defineEmits({} as FakeEmits);
defineSlots<Slots>();

const isMobile = useMediaQuery('(width < 1024px)');
const isModalMountedAndRendered = useIsRendered();
const modalRef = useTemplateRef('modal');

const ModalComponent = computed(() =>
  isMobile.value ? MobileModal : DesktopModal,
);

const { isDismissed, active, requestClose, commitClosedState } =
  useModalLayoutChildApi({
    lockScroll: true,
    defferClose: true,
  });

defineExpose({
  dismiss: (
    intent: ModalDismissActionIntent,
    description?: ModalDismissSourceDescription,
  ) => void requestClose(intent, description),
  scrollTo: ((...args: any) =>
    modalRef.value?.scrollTo(...args)) as Element['scrollTo'],
});
</script>

<template>
  <ModalComponent
    ref="modal"
    :active
    :scrollable
    :detent
    :no-overscroll="true"
    :size
    :dismissed="isDismissed"
    :preopened="isModalMountedAndRendered"
    @closed="commitClosedState()"
    @dismiss="requestClose"
  >
    <template #default="{ dismiss }">
      <slot :dismiss="dismiss" />
    </template>
  </ModalComponent>
</template>
