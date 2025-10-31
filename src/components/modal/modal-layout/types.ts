import type { ReadonlyDeep } from 'type-fest';
import type { Component, Ref } from 'vue';

import type {
  CustomComponentProps,
  PosixTimestampInMilliseconds,
} from '../../../utils';

import type { RichCloseEvent } from './events';

/**
 * - `cancel` — modal was closed without accessing intended user-flow.
 *   Example: click on backdrop, close request from outside, click on header
 *   close button, click on ESC button.
 * - `resolve` — modal was closed via intended user-flow.
 */
export type ModalDismissActionIntent = 'cancel' | 'resolve';

/**
 * Description of dismiss source. For now this value only purpose is for analytics.
 *  **So avoid using this field anywhere else!**
 *
 * @example
 * "backdrop"
 * "header:x"
 * "my fancy button was clicked:3"
 */
export type ModalDismissSourceDescription = undefined | string;

export type ModalDismissSource =
  | {
      origin: 'unknown';
      input: 'unknown';
      description: ModalDismissSourceDescription | undefined;
    }
  | {
      origin: 'external';
      input: 'unknown';
      description: ModalDismissSourceDescription | undefined;
    }
  | {
      origin: 'user';
      input: 'hardware' | 'ui' | 'unknown';
      description: ModalDismissSourceDescription | undefined;
    };

export interface ModalDismissAction {
  intent: ModalDismissActionIntent;
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
  active: boolean;
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
