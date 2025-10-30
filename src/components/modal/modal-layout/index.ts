export type {
  ModalLayoutChildEmits,
  ModalLayoutChildProps,
  InferDataTypeFromModalComponent,
  InferValueTypeFromModalComponent,
  ModalDismissSource,
  ModalDismissActionIntent,
  ModalDismissAction,
  ModalResolution,
} from './types';

export type { ModalDismissEvent, ModalMountedEvent, ModalOpenEvent, ModalUnmountedEvent } from './modal-layout.vue';

export { RichCancelEvent, RichCloseEvent } from './events';

export { default as ModalLayout } from './modal-layout.vue';
export { useModalLayout } from './use-modal-layout';
export { useModalLayoutChildApi } from './use-modal-layout-child-api';
