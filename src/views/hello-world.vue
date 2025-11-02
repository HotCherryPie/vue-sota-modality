<script setup lang="ts">
import { useModal } from '../components';

import ExampleModal from './example-modal.vue';
import ModalA from './modals/ex-a.vue';

const modalExample = useModal(ExampleModal);
const modalA = useModal(ModalA);
</script>

<template>
  <div :class="$style.root">
    <h1>Hi</h1>
    <img
      width="300px"
      style="aspect-ratio: 4/3"
      src="https://cdn.dribbble.com/userupload/45470481/file/7f6be2427e0df44c3b514157f1f1c895.jpg"
      alt=""
    />
    <button type="button" @click="modalExample.open()">Open •••</button>
    <button type="button" @click="modalA.open()">Open A</button>
  </div>
</template>

<style module>
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  min-height: 100dvh;
}
</style>
