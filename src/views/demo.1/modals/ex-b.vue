<script setup lang="ts">
import { Modal, useModal } from '../../../ui-kit';

import ModalC from './ex-c.vue';

const modal = useModal(ModalC);
</script>

<template>
  <Modal scrollable>
    <div style="height: 500px; display: grid; place-items: center">
      <div>B</div>
      <br />
      <br />
      <pre>{{ JSON.stringify($attrs, undefined, 2) }}</pre>
      <button type="button" @click="modal.open()">Open C</button>
    </div>
  </Modal>
</template>
