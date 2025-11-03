<script setup lang="ts">
import { Sheet } from '../../../components';
import { useModal } from '../../../hooks/modality';

import ModalC from './ex-c.vue';

const modal = useModal(ModalC);
</script>

<template>
  <Sheet scrollable>
    <div style="height: 500px; display: grid; place-items: center">
      <div>B</div>
      <br />
      <br />
      <pre>{{ JSON.stringify($props, undefined, 2) }}</pre>
      <button type="button" @click="modal.open()">Open C</button>
    </div>
  </Sheet>
</template>
