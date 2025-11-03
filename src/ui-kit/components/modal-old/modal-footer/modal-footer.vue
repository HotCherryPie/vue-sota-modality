<script setup lang="ts">
interface Props {
  sticky?: boolean;
}

interface Slots {
  default: () => unknown;
}

defineProps<Props>();
defineSlots<Slots>();
</script>

<template>
  <div :class="[$style.root, sticky && $style.sticky]">
    <slot />
  </div>
</template>

<style module>
.root {
  --padding: var(--modal-padding-modal-mobile);

  display: flex;
  flex-direction: column;
  background-color: var(--modal-color-bg);
  padding-block: var(--padding) max(var(--padding), env(safe-area-inset-bottom));
  padding-inline: var(--padding);

  @media (--desktop-small) {
    --padding: var(--modal-padding-modal-desktop);
  }

  &.sticky {
    position: sticky;
    bottom: 0;
  }
}
</style>
