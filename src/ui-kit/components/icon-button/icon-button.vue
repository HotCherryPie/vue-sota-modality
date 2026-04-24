<script setup lang="ts">
import type { Slot } from 'vue';

export interface IconButtonProps {
  type: HTMLButtonElement['type'];
}

export interface IconButtonSlots {
  default: Slot;
}

defineProps<IconButtonProps>();
defineSlots<IconButtonSlots>();
</script>

<template>
  <button :type :style="$style.root">
    <slot />
  </button>
</template>

<style module>
.root {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #0001;
}
</style>
