<template>
  <button :style="$style.root">
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
