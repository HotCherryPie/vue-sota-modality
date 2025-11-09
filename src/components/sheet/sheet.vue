<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import { toRef } from 'vue';

import { useModalExtras } from '../../hooks';
import { useIsRendered } from '../../utils';

import type { Types } from './sheet';
import SheetDesktop from './sheet-desktop.vue';
import SheetMobile from './sheet-mobile.vue';

defineProps<Types.Props>();
defineSlots<Types.Slots>();

const isMobile = useMediaQuery('(width < 1024px)');
const isMountedAndRendered = useIsRendered();

const SheetComponent = toRef(() =>
  isMobile.value ? SheetMobile : SheetDesktop,
);

const state = useModalExtras({
  lockScroll: true,
  defferClose: true,
  // Also works with just `true`
  acceptHardwareCloseRequests: (it) => it.stackIndex.value === 0,
});
</script>

<template>
  <SheetComponent
    :inert="state.context.stackIndex.value !== 0"
    :scrollable
    :detent
    :dismissed="state.context.descriptor.isDismissed"
    :preopened="isMountedAndRendered"
    @dismiss="state.dismiss($event)"
    @requestDismiss="state.requestDismiss($event)"
    @closed="state.commitClosedState()"
  >
    <template #default="{ dismiss }">
      <slot :dismiss />
    </template>
  </SheetComponent>
</template>
