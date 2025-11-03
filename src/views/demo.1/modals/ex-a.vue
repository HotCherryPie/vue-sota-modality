<script setup lang="ts">
import { Modal, useModal } from '../../../ui-kit';

import ModalB from './ex-b.vue';

const modal = useModal(ModalB);
</script>

<template>
  <Modal scrollable>
    <div style="height: 500px; display: grid; place-items: center">
      <div>A</div>
      <br />
      <br />
      <pre>{{ JSON.stringify($props, undefined, 2) }}</pre>
      <button type="button" @click="modal.open()">Open B</button>
    </div>
  </Modal>
</template>
