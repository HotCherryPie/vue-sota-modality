<script setup lang="ts">
import DOMPurify from 'dompurify';
import type { Config as DomPurifyConfig } from 'dompurify';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

interface Props {
  html: string;
  allowStyles?: boolean | undefined;
  allowedAttributes?: '*' | string[] | undefined;
  allowedTags?: '*' | string[] | undefined;
  /** Have higher priority than `allowedAttributes` prop */
  forbiddenAttributes?: string[] | undefined;
  /** Have higher priority than `allowedTags` prop */
  forbiddenTags?: string[] | undefined;
}

const props = defineProps<Props>();

const sanitizeOptions = computed(() => {
  const options: DomPurifyConfig & {
    FORBID_ATTR: NonNullable<DomPurifyConfig['FORBID_ATTR']>;
  } = {
    FORBID_ATTR: ['style'],
  };

  if (props.allowedTags !== '*' && props.allowedTags !== undefined)
    options.ALLOWED_TAGS = props.allowedTags;
  if (props.allowedAttributes !== '*' && props.allowedAttributes !== undefined)
    options.ALLOWED_ATTR = props.allowedAttributes ?? [];

  if (props.forbiddenTags !== undefined)
    options.FORBID_TAGS = props.forbiddenTags;
  if (props.forbiddenAttributes !== undefined) {
    options.FORBID_ATTR.push(...props.forbiddenAttributes);
  }

  if (props.allowStyles) {
    options.FORBID_ATTR = options.FORBID_ATTR.filter((it) => it !== 'style');
    options.ALLOWED_ATTR?.push('style');
  }

  return options;
});

const router = useRouter();

// Query params is not supported atm
const handleNavigation = (event: MouseEvent) => {
  const target = event.target;

  if (target instanceof HTMLAnchorElement) {
    const { href, target: hrefTarget } = target;
    const url = new URL(href);

    const isSameHostname = url.hostname === document.location.hostname;
    const isLocalNavigation =
      isSameHostname && ['', '_self'].includes(hrefTarget);

    if (isLocalNavigation) {
      const { matched } = router.resolve({ path: url.pathname });

      if (matched.length > 0) {
        event.preventDefault();
        router.push({ path: url.pathname });
      }
    }
  }
};
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    :class="$style.root"
    @click="handleNavigation($event)"
    v-html="DOMPurify.sanitize(props.html, sanitizeOptions)"
  />
</template>

<style module lang="postcss">
.root {
  display: contents;
}
</style>
