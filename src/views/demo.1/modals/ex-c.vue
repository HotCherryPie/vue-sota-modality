<script setup lang="ts">
import { Modal } from '../../../ui-kit';
</script>

<template>
  <Modal scrollable>
    <div style="height: 500px; display: grid; place-items: center">
      <div>C</div>
      <br />
      <br />
      <pre>{{ JSON.stringify($props, undefined, 2) }}</pre>
    </div>
  </Modal>
</template>
