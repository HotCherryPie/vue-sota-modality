<script setup lang="ts">
interface Props {
  sticky?: boolean;
}

defineProps<Props>();
</script>

<template>
  <div :class="[$style.root, sticky && $style.sticky]">
    <slot />
  </div>
</template>

<style lang="postcss" module>
.root {
  --padding: var(--modal-padding-modal-mobile);

  display: flex;
  flex-direction: column;
  background-color: var(--modal-color-bg);
  padding-block: var(--padding) max(var(--padding), var(--safe-area-inset-block-end));
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
