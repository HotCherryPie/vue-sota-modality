import type { Types } from './modality-layout';

// eslint-disable-next-line import/export
export declare namespace ModalityLayout {
  // eslint-disable-next-line unicorn/prefer-export-from
  export type { Types };
}

// @ts-expect-error it is what it is
// eslint-disable-next-line import/export
export { default as ModalityLayout } from './modality-layout.vue';

export * from './create-modality-layout-state';
export * from './use-modality-layout-api';
export * from './use-modality-layout-child-api';
