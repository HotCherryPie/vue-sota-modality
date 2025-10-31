<script setup lang="ts">
/* Кнопка закрытия лежащая внутри `.coverHolder` исключительно декоративная,
 *  поэтому она намеренно помечена как `inert`. При этом `.coverHolder`
 *  в стилях имеет `pointer-events: none`, что делает доступной для клика
 *  реальную кнопку закрытия, которая находится под обложкой.
 */

import { useParentElement, useIntersectionObserver } from '@vueuse/core';
import { useTemplateRef, ref, computed, toRef } from 'vue';

import { Close, NavBack } from '../../../icons';
import { CustomHtml } from '../../custom-html';
import { IconButton } from '../../icon-button';

import type { Props, Emits, Slots } from './types';

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
defineSlots<Slots>();

const parentRef = useParentElement();
const overlayHeaderTriggerRef = useTemplateRef('overlayHeaderTrigger');
const overlayHeaderShown = ref(false);

const isPrimaryHeaderVisible = toRef(
  () => props.title || props.subtitle || props.isBackShown,
);
const headerTitle = toRef(() => props.floatingHeaderTitle ?? props.title ?? '');
const headerButtons = computed(
  () =>
    [
      ...(props.buttons ?? []),
      { Icon: Close, onClick: () => void emit('close') },
    ] satisfies Props.Button[],
);

useIntersectionObserver(
  () => overlayHeaderTriggerRef.value,
  ([it]) => {
    overlayHeaderShown.value = it?.isIntersecting === false;
  },
  { threshold: 1, root: parentRef },
);
</script>

<template>
  <div :class="$style.root">
    <div :class="$style.buttonsHolder">
      <div :class="$style.titleButtonBlock">
        <IconButton
          v-if="!title && titleButton"
          @click="titleButton?.onClick()"
        >
          <component :is="titleButton.Icon" v-if="titleButton?.Icon" />
        </IconButton>
      </div>

      <div :class="[$style.buttons, $style.buttonsArray]">
        <IconButton
          v-for="(btn, index) of headerButtons"
          :key="index"
          :class="$style.button"
          @click="btn.onClick()"
        >
          <component :is="btn.Icon" />
        </IconButton>
      </div>
    </div>

    <div :class="$style.overlayHeaderHolder">
      <div :class="$style.overlayHeaderClipper">
        <div
          :class="[$style.overlayHeader, overlayHeaderShown && $style.active]"
          :inert="!overlayHeaderShown"
        >
          <IconButton
            v-if="isBackShown"
            :class="$style.back"
            @click="$emit('back')"
          >
            <NavBack />
            {{ backText }}
          </IconButton>
          <div v-else />

          <CustomHtml
            :class="$style.title"
            :html="headerTitle"
            :allowedTags="[]"
          />
          <div :class="[$style.buttonsStub, $style.buttonsArray]">
            <component
              :is="btn.Icon"
              v-for="(btn, index) of headerButtons"
              :key="index"
              size="m"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="$slots['cover']"
      :class="[$style.coverHolder, cutIn && $style.cutIn]"
    >
      <div :class="$style.coverButtonsHolder">
        <div :class="[$style.buttons, $style.buttonsArray]">
          <div
            v-for="(btn, index) of headerButtons"
            :key="index"
            :class="$style.coverButtonStack"
          >
            <div :class="$style.coverButtonBackdrop" />
            <IconButton inert size="m" variant="staticPrimary">
              <component :is="btn.Icon" />
            </IconButton>
          </div>
        </div>
      </div>

      <slot name="cover" />
    </div>

    <div
      v-if="isPrimaryHeaderVisible"
      :class="[
        $style.primaryHeader,
        isBackShown && $style.primaryHeaderWithBack,
      ]"
      :inert="overlayHeaderShown"
    >
      <IconButton
        v-if="isBackShown"
        :class="$style.back"
        @click="$emit('back')"
      >
        <NavBack />
        {{ backText }}
      </IconButton>

      <div
        ref="overlayHeaderTrigger"
        :class="[$style.buttonsStub, $style.buttonsArray]"
      >
        <component
          :is="btn.Icon"
          v-for="(btn, index) of headerButtons"
          :key="index"
          size="m"
        />
      </div>

      <div :class="$style.info">
        <div :class="$style.titleButton">
          <div :class="$style.title">
            {{ title }}
          </div>
          <IconButton
            v-if="title && titleButton"
            @click="titleButton?.onClick()"
          >
            <component :is="titleButton.Icon" v-if="titleButton?.Icon" />
          </IconButton>
        </div>
        <div v-if="subtitle" :class="$style.subtitle">{{ subtitle }}</div>
      </div>
    </div>
    <div v-else ref="overlayHeaderTrigger" />
  </div>
</template>

<style module>
.buttonsHolder {
  position: sticky;
  z-index: var(--z-index-btn);
  top: 0;
}

.buttonsArray {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-20);
}

.buttons {
  position: absolute;
  inset-block-start: var(--modal-padding-modal-mobile);
  inset-inline-end: var(--modal-padding-modal-mobile);

  @media screen and (width >= 1024px) {
    inset-block-start: var(--modal-padding-modal-desktop);
    inset-inline-end: var(--modal-padding-modal-desktop);
  }
}

.button {
}

.buttonsStub {
  visibility: hidden;
}

.coverButtonsHolder {
  position: sticky;
  top: 0;
}

.coverButtonStack {
  position: relative; /* Only for Safari */
  display: grid;
  place-items: center;

  & > * {
    grid-area: 1/1;
  }
}

.coverButtonBackdrop {
  position: absolute;
  z-index: -1;
  width: var(--size-control-s);
  height: var(--size-control-s);
  border-radius: 50%;
  background-color: var(--color-background-base-alfa-static-black-20);
}

.coverHolder {
  z-index: var(--z-index-cover);

  /* "Just-in-case" for transparent content in cover slot */
  background: var(--modal-color-bg);

  /* Like `overflow: clip` but actually works in Safari  */
  mask-image: linear-gradient(#000, #000);

  /* Makes clickable "real" button under the cover */
  pointer-events: none;

  &.cutIn {
    margin-bottom: calc(-1 * var(--rounding-modal-m));
    mask-image: linear-gradient(
      #000,
      #000 calc(100% - 20px),
      #0000 calc(100% - 20px),
      #0000
    );

    @supports (mask-mode: luminance) {
      mask-image:
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='white'%3E%3C/rect%3E%3Crect width='100%25' height='200%25' fill='black' ry='100vh'%3E%3C/rect%3E%3C/svg%3E"),
        linear-gradient(#fff, #fff);
      mask-mode: luminance;
      mask-position: bottom, top;
      mask-repeat: no-repeat;
      mask-size:
        100% var(--rounding-modal-m),
        100% calc(100% - var(--rounding-modal-m));
    }
  }
}

.titleButtonBlock {
  position: absolute;
  inset-block-start: var(--modal-padding-modal-mobile);
  inset-inline-start: var(--modal-padding-modal-mobile);

  @media screen and (width >= 1024px) {
    inset-block-start: var(--modal-padding-modal-desktop);
    inset-inline-start: var(--modal-padding-modal-desktop);
  }
}

.titleButton {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
}

.title {
  color: var(--color-content-base-primary);
  white-space: pre-wrap;

  @add-mixin display-body-label;
}

.subtitle {
  color: var(--color-content-base-secondary);
}

.primaryHeader {
  display: grid;
  column-gap: var(--spacing-16);
  grid-template-areas: 'back buttons' 'info buttons';
  grid-template-columns: auto max-content;
  padding-block: var(--modal-padding-modal-mobile)
    var(--modal-padding-modal-header-bottom-mobile);
  padding-inline: var(--modal-padding-modal-mobile);

  @media screen and (width >= 1024px) {
    padding-block: var(--modal-padding-modal-desktop)
      var(--modal-padding-modal-header-bottom-desktop);
    padding-inline: var(--modal-padding-modal-desktop);
  }

  /* TODO: use :has(.back) selector whenever possible */
  &.primaryHeaderWithBack {
    grid-template-areas: 'back buttons' 'info info';
    grid-template-columns: 1fr 1fr;
  }

  .back {
    /** Do not replace with the parent `gap` property! */
    margin-bottom: var(--spacing-16);
    grid-area: back;
    justify-self: start;
  }

  .buttonsStub {
    grid-area: buttons;
  }

  .info {
    grid-area: info;
  }

  .title {
    @add-mixin h2;

    overflow-wrap: anywhere;
  }

  .subtitle {
    @add-mixin body-regular;

    /** Do not replace with the parent `gap` property! */
    margin-top: var(--spacing-12);
  }
}

.overlayHeaderHolder {
  position: sticky;
  z-index: var(--z-index-overlay-header);
  top: 0;
}

.overlayHeaderClipper {
  position: absolute;
  overflow: hidden;
  inset-inline: 0;
  pointer-events: none;
}

.overlayHeader {
  display: grid;
  padding: var(--modal-padding-modal-mobile);
  border-bottom: 1px solid var(--color-border-base-alfa-container);
  background-color: var(--modal-color-bg);
  grid-template-columns: 1fr minmax(0, auto) 1fr;
  pointer-events: all;
  transform: translateY(-100%);
  transition: transform 0.1s ease-in;

  @media screen and (width >= 1024px) {
    padding: var(--modal-padding-modal-desktop);
  }

  &.active {
    transform: translateY(0);
    transition-timing-function: ease-out;
  }

  .back {
    justify-self: start;

    /** Do not replace with the parent `gap` property! */
    margin-inline-end: var(--spacing-12);
  }

  .buttonsStub {
    /** Do not replace with the parent `gap` property! */
    margin-inline-start: var(--spacing-12);
  }

  .title {
    @add-mixin display-body-semibold;

    display: block; /* Override display: contents from CustomHtml */
    overflow: hidden;
    color: var(--color-content-base-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.root {
  --z-index-overlay-header: 1000;
  --z-index-btn: 1001;
  --z-index-cover: 1002;

  display: contents;

  &:has(.button:nth-child(1):focus-visible)
    .coverButtonStack:nth-child(1)
    .coverButtonBackdrop,
  &:has(.button:nth-child(2):focus-visible)
    .coverButtonStack:nth-child(2)
    .coverButtonBackdrop,
  &:has(.button:nth-child(3):focus-visible)
    .coverButtonStack:nth-child(3)
    .coverButtonBackdrop {
    outline: 2px solid dodgerblue;
  }
}
</style>
