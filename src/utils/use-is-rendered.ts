import { onMounted, readonly, ref } from 'vue';

export const useIsRendered = () => {
  const isRendered = ref(false);

  onMounted(() => {
    requestAnimationFrame(() =>
      setTimeout(() => {
        isRendered.value = true;
      }),
    );
  });

  return readonly(isRendered);
};
