import type { ExtractStrict, ReadonlyDeep } from 'type-fest';
import type { Component, Ref } from 'vue';

import type {
  CustomComponentProps,
  PosixTimestampInMilliseconds,
} from '../../../utils';

import type { RichCloseEvent } from './events';

export declare namespace ModalDismissSource {
  /**
   * Description of dismiss source. For now this value only purpose is for analytics.
   *  **So avoid using this field anywhere else!**
   *
   * @example "my fancy button was clicked:3"
   */
  // eslint-disable-next-line sonar/redundant-type-aliases
  export type Description = string;

  export type Input = 'unknown' | 'ui' | 'hardware';
  export type Origin = 'unknown' | 'user' | 'external';
}

export type ModalDismissSource =
  | {
      origin: ExtractStrict<ModalDismissSource.Origin, 'unknown'>;
      input: ExtractStrict<ModalDismissSource.Input, 'unknown'>;
      description: ModalDismissSource.Description | undefined;
    }
  | {
      origin: ExtractStrict<ModalDismissSource.Origin, 'external'>;
      input: ExtractStrict<ModalDismissSource.Input, 'unknown'>;
      description: ModalDismissSource.Description | undefined;
    }
  | {
      origin: ExtractStrict<ModalDismissSource.Origin, 'user'>;
      input: ModalDismissSource.Input;
      description: ModalDismissSource.Description | undefined;
    };

export namespace ModalDismissAction {
  /**
   * - `cancel` — modal was closed without accessing intended user-flow.
   *   Example: click on backdrop, close request from outside, click on header
   *   close button, click on ESC button and etc.
   * - `resolve` — modal was closed via intended user-flow.
   */
  export type Intent = 'cancel' | 'resolve';
}

export interface ModalDismissAction {
  intent: ModalDismissAction.Intent;
  source: ModalDismissSource;
}

export interface ModalResolution<TValue = unknown> {
  action: ModalDismissAction;
  value: TValue;
}

export interface ModalViewDescriptor<TData = unknown, TValue = unknown> {
  readonly key: string;

  /**
   * Data for `data` prop of the modal component.
   */
  readonly data: ReadonlyDeep<TData>;

  /**
   * Triggers when client requires modal dismiss.
   */
  readonly requestedDismissAction: Ref<ModalDismissAction | undefined>;

  /**
   * Value of the modal. Usually used for modals with selection ability.
   */
  readonly value: Ref<TValue>;

  /**
   * Whether modal was dismissed, and now at closing state.
   */
  readonly isDismissed: Ref<boolean>;

  /**
   * Resolves at the moment of confirmed dismiss. Closing animation
   *  is not considered.
   */
  readonly resolutionPromise: PromiseWithResolvers<ModalResolution<TValue>>;

  /**
   * Time of modal open request.
   */
  readonly calledAt: PosixTimestampInMilliseconds;

  /**
   * Time of modal dismiss request.
   */
  dismissedAt: PosixTimestampInMilliseconds | undefined;
}

export interface ModalLayoutChildEmits<TValue = never> {
  'update:modelValue': [value: TValue];
}

export type ModalLayoutChildProps<TData = never, TValue = never> = {
  /**
   * `undefined` if modal dismissed, number otherwise.
   * TODO: rename to `stackActiveIndex`
   */
  stackIndex: number;
  data: TData;
  requestedDismissAction: ModalDismissAction | undefined;
  modelValue: TValue;
};

export type InferDataTypeFromModalComponent<TComponent extends Component> =
  CustomComponentProps<TComponent> extends { data: infer DataType } ? DataType
  : never;

export type InferValueTypeFromModalComponent<TComponent extends Component> =
  CustomComponentProps<TComponent> extends { modelValue: infer ValueType } ?
    ValueType
  : never;

export type ModalLayoutChildCloseEventPayload =
  | undefined
  | Promise<unknown>
  | Event
  | CustomEvent<Promise<unknown>>
  | RichCloseEvent;

export namespace ModalLayoutEmits {
  export interface ModalOpenEvent {
    name: string | undefined;
    time: number;
  }

  export interface ModalDismissEvent {
    name: string | undefined;
    time: number;
    action: ModalDismissAction;
  }

  export interface ModalMountedEvent {
    name: string | undefined;

    /** Time in milliseconds between mount and `open()` call */
    wait: number;
  }

  export interface ModalUnmountedEvent {
    name: string | undefined;

    /** Time in milliseconds between `dismiss()` call and unmount */
    wait: number;
  }
}

export interface ModalLayoutEmits {
  modalOpen: [event: ModalLayoutEmits.ModalOpenEvent];
  modalDismiss: [event: ModalLayoutEmits.ModalDismissEvent];
  modalMounted: [event: ModalLayoutEmits.ModalMountedEvent];
  modalUnmounted: [event: ModalLayoutEmits.ModalUnmountedEvent];
  presenceChange: [someModalsAreOpen: boolean];
}
