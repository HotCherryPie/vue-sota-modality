<script setup lang="ts">
import { Sheet } from '../../../components';
import { useModal } from '../../../hooks/modality';

import ModalB from './ex-b.vue';

const modal = useModal(ModalB);
</script>

<template>
  <Sheet scrollable>
    <div style="height: 500px; display: grid; place-items: center">
      <div>A</div>
      <br />
      <br />
      <pre>{{ JSON.stringify($props, undefined, 2) }}</pre>
      <button type="button" @click="modal.open()">Open B</button>
    </div>
  </Sheet>
</template>
