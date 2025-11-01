<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import { computed } from 'vue';

import { useIsRendered } from '../../../utils';
import { useModalLayoutChildApi } from '../modal-layout';
import type {
  ModalDismissAction,
  RichCancelEvent,
  RichCloseEvent,
} from '../modal-layout';
import type { ModalDismissSource } from '../modal-layout/types';

import DesktopModal from './desktop-modal.vue';
import MobileModal from './mobile-modal.vue';
import type { Props, Slots } from './types';

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
// eslint-disable-next-line vue/define-emits-declaration, ts/no-unsafe-type-assertion
defineEmits({} as FakeEmits);
defineSlots<Slots>();

const isMobile = useMediaQuery('(width < 1024px)');
const isModalMountedAndRendered = useIsRendered();

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
    intent: ModalDismissAction.Intent,
    description?: ModalDismissSource.Description,
  ) => void requestClose(intent, description),
});
</script>

<!-- eslint-disable vue/v-on-handler-style -->
<template>
  <ModalComponent
    :scrollable
    :detent
    :noOverscroll="true"
    :active
    :size
    :dismissed="isDismissed"
    :preopened="isModalMountedAndRendered"
    @closed="commitClosedState()"
    @dismiss="requestClose"
  >
    <template #default="{ dismiss }">
      <slot :dismiss />
    </template>
  </ModalComponent>
</template>
