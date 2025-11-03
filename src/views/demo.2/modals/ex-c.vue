<script setup lang="ts">
import { Sheet } from '../../../components';
</script>

<template>
  <Sheet scrollable>
    <div style="height: 500px; display: grid; place-items: center">
      <div>C</div>
      <br />
      <br />
      <pre>{{ JSON.stringify($props, undefined, 2) }}</pre>
    </div>
  </Sheet>
</template>
