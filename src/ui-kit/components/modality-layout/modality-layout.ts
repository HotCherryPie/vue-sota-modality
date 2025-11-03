import type { ExtractStrict, SetNonNullable } from 'type-fest';
import { provide, shallowReactive } from 'vue';
import type { Component, InjectionKey, Ref, ShallowReactive } from 'vue';

import type { PosixTimestampInMilliseconds } from '../../../utils';

export declare namespace Types {
  export namespace Child {
    export namespace DismissSource {
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

    export type DismissSource =
      | {
          origin: ExtractStrict<DismissSource.Origin, 'unknown'>;
          input: ExtractStrict<DismissSource.Input, 'unknown'>;
          description: DismissSource.Description | undefined;
        }
      | {
          origin: ExtractStrict<DismissSource.Origin, 'external'>;
          input: ExtractStrict<DismissSource.Input, 'unknown'>;
          description: DismissSource.Description | undefined;
        }
      | {
          origin: ExtractStrict<DismissSource.Origin, 'user'>;
          input: DismissSource.Input;
          description: DismissSource.Description | undefined;
        };

    export namespace DismissAction {
      /**
       * - `cancel` — child was closed without accessing intended user-flow.
       *   Example: click on backdrop, close request from outside, click on header
       *   close button, click on ESC button and etc.
       * - `resolve` — child was closed via intended user-flow.
       */
      export type Intent = 'cancel' | 'resolve';
    }

    export interface DismissAction {
      intent: DismissAction.Intent;
      source: DismissSource;
    }

    export interface Resolution<TValue = unknown> {
      action: DismissAction;
      value: TValue;
    }

    export namespace Descriptor {
      // eslint-disable-next-line sonar/redundant-type-aliases
      export type Key = string;
    }

    export interface Descriptor<TData = never, TValue = never> {
      component: Child<TData, TValue>;

      /**
       * Unique per instance key.
       */
      key: Descriptor.Key;

      /**
       * Data for `data` prop of the child component.
       */
      data: TData;

      /**
       * Triggers when client requires child dismiss.
       */
      requestedDismissAction: DismissAction | undefined;

      /**
       * Value of the child. Usually used for child with selection ability.
       */
      value: Ref<TValue>;

      /**
       * Whether child was dismissed, and now at closing state.
       */
      isDismissed: boolean;

      /**
       * Resolves at the moment of confirmed dismiss. Closing animation
       *  is not considered.
       */
      resolutionPromise: PromiseWithResolvers<Resolution<TValue>>;

      /**
       * Time of child open request.
       */
      calledAt: PosixTimestampInMilliseconds;

      /**
       * Time of child dismiss request.
       */
      dismissedAt: PosixTimestampInMilliseconds | undefined;
    }

    export type DescriptorAfterDismiss<
      TData = never,
      TValue = never,
    > = SetNonNullable<
      Child.Descriptor<TData, TValue>,
      'dismissedAt' | 'isDismissed' | 'requestedDismissAction'
    > & {
      isDismissed: true;
    };

    export type Props<TData = never, TValue = never> = {
      /**
       * `undefined` if child dismissed, number otherwise.
       * TODO: rename to `stackActiveIndex`
       */
      stackIndex: number | undefined;
      data: TData;
      requestedDismissAction: DismissAction | undefined;
      modelValue: TValue;
    };

    export interface Emits<TValue = never> {
      'update:modelValue': [value: TValue];
    }
  }

  /* eslint-disable ts/no-explicit-any */
  export type Child<TData = never, TValue = never> = Component<
    // WARN: for now allows Child<number> = Child<1> which is not safe
    Record<string, any> & Partial<Child.Props<TData, TValue>>,
    any,
    any,
    any,
    any,
    // WARN: not actually resolves
    Record<string, any> & Partial<Child.Emits<TValue>>
  >;
  /* eslint-enable ts/no-explicit-any */

  export namespace Emits {
    export interface ModalOpenEvent {
      descriptor: Child.Descriptor<unknown, unknown>;

      /* performance.now*() if .open() call */
      time: number;
    }

    export interface ModalDismissEvent {
      descriptor: Types.Child.DescriptorAfterDismiss<unknown, unknown>;

      /* performance.now*() if .dismiss() call */
      time: number;
    }

    export interface ModalMountedEvent {
      descriptor: Child.Descriptor<unknown, unknown>;

      /** Time in milliseconds between mount and `open()` call */
      wait: number;
    }

    export interface ModalUnmountedEvent {
      descriptor: Child.Descriptor<unknown, unknown>;

      /** Time in milliseconds between `dismiss()` call and unmount */
      wait: number;
    }
  }

  export interface Emits {
    modalOpen: [event: Emits.ModalOpenEvent];
    modalDismiss: [event: Emits.ModalDismissEvent];
    modalMounted: [event: Emits.ModalMountedEvent];
    modalUnmounted: [event: Emits.ModalUnmountedEvent];
    presenceChange: [
      state: { someChildAreShown: boolean; someChildAreActive: boolean },
    ];
  }
}

export interface InternalState {
  readonly children: ShallowReactive<
    // eslint-disable-next-line ts/no-explicit-any
    Map<Types.Child.Descriptor.Key, Types.Child.Descriptor<any, any>>
  >;

  readonly isOpen: (key: Types.Child.Descriptor.Key) => boolean;
  readonly isOpenSimilar: (component: Component) => boolean;

  getChildByKey: (
    key: Types.Child.Descriptor.Key,
  ) => Types.Child.Descriptor<unknown, unknown> | undefined;
  getChildrenByComponent: (
    component: Component,
  ) => Types.Child.Descriptor<unknown, unknown>[];

  readonly openChild: <TValue = unknown>(
    component: Component,
    key: Types.Child.Descriptor.Key,
    data: unknown,
    value: Ref<TValue>,
  ) => Promise<Types.Child.Resolution<TValue>> | undefined;
  readonly callForChildDismiss: (
    key: Types.Child.Descriptor.Key,
    action: Types.Child.DismissAction,
  ) => void;
  readonly dismissChild: (
    key: Types.Child.Descriptor.Key,
    promise: Promise<unknown>,
    action: Types.Child.DismissAction,
  ) => void;
}

export interface UseInternalStateInit {
  onOpen: (descriptor: Types.Child.Descriptor<unknown, unknown>) => void;
  onDismiss: (
    descriptor: Types.Child.DescriptorAfterDismiss<unknown, unknown>,
  ) => void;
}

export const INTERNAL_STATE_INJECTION_KEY: InjectionKey<InternalState> =
  Symbol('');

export const useInternalState = (init: UseInternalStateInit): InternalState => {
  // We should not care about any possible changes in descriptors. Also `reactive`
  //  unwraps refs, but at least `requestedDismissAction` should be preserved as is.
  const children = shallowReactive(
    new Map<
      Types.Child.Descriptor.Key,
      Types.Child.Descriptor<unknown, unknown>
    >(),
  );

  const getChildByKey = (key: Types.Child.Descriptor.Key) => children.get(key);

  const getChildrenByComponent = (component: Component) =>
    // TODO: remove `Iterator.from()` after fix
    //  https://github.com/vuejs/core/issues/12615
    Iterator.from(children.values())
      .filter((it) => it.component === component)
      .toArray();

  const isOpen = (key: Types.Child.Descriptor.Key) =>
    getChildByKey(key) !== undefined;

  const isOpenSimilar = (component: Component) =>
    // TODO: remove `Iterator.from()` after fix
    //  https://github.com/vuejs/core/issues/12615
    Iterator.from(children.values()).some((it) => it.component === component);

  const openChild = <TData = unknown, TValue = unknown>(
    component: Types.Child<TData, TValue>,
    key: Types.Child.Descriptor.Key,
    data: NoInfer<TData>,
    value: Ref<NoInfer<TValue>>,
    allowSame: boolean = false,
  ) => {
    if (!allowSame && isOpenSimilar(component)) {
      if (import.meta.env.DEV) console.warn('Similar modal is already opened!');
      return;
    }

    const resolutionPromise =
      Promise.withResolvers<Types.Child.Resolution<TValue>>();

    // @ts-expect-error "Type 'Child<TData, TValue>' is not assignable to
    //  type 'Child<unknown, unknown>' with 'exactOptionalPropertyTypes: true'"
    const descriptor: Types.Child.Descriptor<unknown, unknown> =
      shallowReactive({
        component,
        key,
        data,
        value,
        isDismissed: false,
        requestedDismissAction: undefined,
        resolutionPromise,
        calledAt: performance.now(),
        dismissedAt: undefined,
      }) satisfies Types.Child.Descriptor<TData, TValue>;

    state.children.set(key, descriptor);

    init.onOpen(descriptor);

    return resolutionPromise.promise;
  };

  const callForChildDismiss = (
    key: Types.Child.Descriptor.Key,
    action: Types.Child.DismissAction,
  ) => {
    const descriptor = getChildByKey(key);

    if (descriptor === undefined) {
      if (import.meta.env.DEV)
        console.warn('You try to dismiss child which is not presented yet!');
      return;
    }

    if (descriptor.isDismissed) {
      if (import.meta.env.DEV)
        console.warn('You try to dismiss already dismissed child!');
      return;
    }

    // Request for dismiss. This this not real dismiss, because this action can
    //  be discarded further.
    descriptor.requestedDismissAction = action;
  };

  const dismissChild = (
    key: Types.Child.Descriptor.Key,
    promise: Promise<unknown>,
    action: Types.Child.DismissAction,
  ) => {
    const descriptor = getChildByKey(key);

    if (descriptor === undefined) {
      if (import.meta.env.DEV)
        console.warn(
          '.scheduleChildRemoving() was called for non-presented child!',
        );
      return;
    }

    const updatedProperties = {
      isDismissed: true as const,
      dismissedAt: performance.now(),
      requestedDismissAction: action,
    } as const;

    const descriptorAfterDismiss = Object.assign(
      descriptor,
      updatedProperties,
      // eslint-disable-next-line ts/no-explicit-any
    ) satisfies Types.Child.DescriptorAfterDismiss<any, any>;

    descriptor.resolutionPromise.resolve({
      value: descriptorAfterDismiss.value,
      action,
    });

    init.onDismiss(descriptorAfterDismiss);

    void promise.then(() => void children.delete(key));
  };

  const state = {
    children,
    isOpen,
    isOpenSimilar,
    getChildByKey,
    getChildrenByComponent,
    openChild,
    callForChildDismiss,
    dismissChild,
  } as const satisfies InternalState;

  provide(INTERNAL_STATE_INJECTION_KEY, state);

  return state;
};
