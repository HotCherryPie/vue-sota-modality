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
    @presence-change="state.someModalsShown = $event"
    @modal-mounted="$emit('modalMounted', $event)"
    @modal-unmounted="$emit('modalUnmounted', $event)"
    @modal-open="$emit('modalOpen', $event)"
    @modal-dismiss="$emit('modalDismiss', $event)"
  />
</template>

<style>
main {
  display: contents;
}
</style>
