<script setup lang="ts">
import { shallowReactive } from 'vue';

import { Notification } from '../../components';
import { useModal, useNotification } from '../../hooks/modality';
import { modalsScope, notificationsScope } from '../../hooks/modality/scopes';
import { ModalityLayout } from '../../ui-kit';

import ModalA from './modals/ex-a.vue';

const state = shallowReactive({
  someModalsShown: false,
});

const modalA = useModal(ModalA);
const notifications = useNotification(Notification);
</script>

<template>
  <main :inert="state.someModalsShown">
    <div :class="$style.root">
      <h1>Hi</h1>
      <img
        width="300px"
        style="aspect-ratio: 4/3"
        src="https://cdn.dribbble.com/userupload/45470481/file/7f6be2427e0df44c3b514157f1f1c895.jpg"
        alt=""
      />
      <button type="button" @click="modalA.open()">Open Modal A</button>
      <button type="button" @click="notifications.show()">
        Show Notification •••
      </button>
    </div>
  </main>

  <ModalityLayout
    :class="$style.modalLayout"
    :scope="modalsScope"
    @presenceChange="state.someModalsShown = $event.someChildAreActive"
  />
  <ModalityLayout
    :class="$style.notificationsLayout"
    :scope="notificationsScope"
  />
</template>

<!-- eslint-disable vue/enforce-style-attribute -->
<style>
html {
  background-color: #eee;
}
main {
  display: contents;
}
</style>

<style module>
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  min-height: 100dvh;
}

.modalLayout {
  z-index: 8888;
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  contain: size;
}

.notificationsLayout {
  z-index: 9999;
  position: fixed;
  top: 0;
  inset-inline: 0;
  flex-direction: column;
  contain: size;
  display: flex;
  align-items: end;
}
</style>
