<script setup lang="ts">
import { shallowReactive } from 'vue';

import { ModalLayout } from './components';
import HelloWorld from './views/hello-world.vue';

const state = shallowReactive({
  someModalsShown: false,
});
</script>

<template>
  <main :inert="state.someModalsShown">
    <HelloWorld />
  </main>

  <ModalLayout
    style="z-index: 9999"
    @presenceChange="state.someModalsShown = $event"
  />
</template>

<!-- eslint-disable vue/enforce-style-attribute -->
<style>
main {
  display: contents;
}
</style>
