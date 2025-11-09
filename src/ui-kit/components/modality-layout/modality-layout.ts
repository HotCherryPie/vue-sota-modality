import type { ExtractStrict, SetNonNullable } from 'type-fest';
import { shallowReactive } from 'vue';
import type {
  Component,
  InjectionKey,
  Ref,
  ShallowReactive,
  ShallowRef,
} from 'vue';

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
      value: ShallowRef<TValue>;

      /**
       * TODO: use only `.dismissedAt`
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
      calledAt: Date;

      /**
       * Time of child dismiss request.
       */
      dismissedAt: Date | undefined;
    }

    export type DescriptorAfterDismiss<
      TData = never,
      TValue = never,
    > = SetNonNullable<
      Child.Descriptor<TData, TValue>,
      'dismissedAt' | 'requestedDismissAction'
    > & {
      isDismissed: true;
    };

    export interface Context {
      descriptor: Descriptor<unknown, unknown>;
      stackIndex: Readonly<Ref<number | undefined>>;
    }

    // eslint-disable-next-line ts/no-explicit-any
    export type InferValueType<T> = T extends Child<any, infer F> ? F : never;
    export type InferDataType<T> = T extends Child<infer F> ? F : never;

    export interface Props<TData = never, TValue = never> {
      /**
       * `undefined` if child dismissed, number otherwise.
       * TODO: rename to `stackActiveIndex`
       */
      stackIndex: number | undefined;
      data: TData;
      requestedDismissAction: DismissAction | undefined;
      modelValue: TValue;
    }

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

  export type Scope = InjectionKey<InternalState>;

  export namespace Props {
    // eslint-disable-next-line ts/no-empty-object-type
    export interface ExternalState extends InternalState {}
  }

  export interface Props {
    /**
     * WARN: Not reactive! Can only be passed at first mount.
     */
    state?: Props.ExternalState | undefined;

    scope?: Types.Scope | undefined;
  }

  export namespace Emits {
    export interface ChildOpenEvent {
      descriptor: Child.Descriptor<unknown, unknown>;

      /* performance.now*() if .open() call */
      time: number;
    }

    export interface ChildDismissEvent {
      descriptor: Types.Child.DescriptorAfterDismiss<unknown, unknown>;

      /* performance.now*() if .dismiss() call */
      time: number;
    }

    export interface ChildMountedEvent {
      descriptor: Child.Descriptor<unknown, unknown>;

      /** Time in milliseconds between mount and `open()` call */
      wait: number;
    }

    export interface ChildUnmountedEvent {
      descriptor: Child.Descriptor<unknown, unknown>;

      /** Time in milliseconds between `dismiss()` call and unmount */
      wait: number;
    }
  }

  export interface Emits {
    modalOpen: [event: Emits.ChildOpenEvent];
    modalDismiss: [event: Emits.ChildDismissEvent];
    modalMounted: [event: Emits.ChildMountedEvent];
    modalUnmounted: [event: Emits.ChildUnmountedEvent];
    presenceChange: [
      state: { someChildAreShown: boolean; someChildAreActive: boolean },
    ];
  }

  export interface Slots {
    default: () => unknown;
  }
}

export namespace InternalState {
  export interface OpenHandle<TValue> {
    readonly key: Types.Child.Descriptor.Key;
    readonly resolutionPromise: Promise<Types.Child.Resolution<TValue>>;
  }
}

export interface InternalState {
  readonly children: ShallowReactive<
    // eslint-disable-next-line ts/no-explicit-any
    Map<Types.Child.Descriptor.Key, Types.Child.Descriptor<any, any>>
  >;

  readonly isOpen: (key: Types.Child.Descriptor.Key | undefined) => boolean;
  readonly isOpenSimilar: (component: Component | undefined) => boolean;

  readonly getChildByKey: (
    key: Types.Child.Descriptor.Key | undefined,
  ) => Types.Child.Descriptor<unknown, unknown> | undefined;
  readonly getChildrenByComponent: (
    component: Component | undefined,
  ) => Types.Child.Descriptor<unknown, unknown>[];

  readonly openChild: <TData, TValue>(
    component: Types.Child<TData, TValue>,
    data: NoInfer<TData>,
    value: ShallowRef<NoInfer<TValue>>,
  ) => InternalState.OpenHandle<TValue> | undefined;

  readonly requestChildDismiss: (
    key: Types.Child.Descriptor.Key,
    action: Types.Child.DismissAction,
  ) => void;

  readonly dismissChild: (
    key: Types.Child.Descriptor.Key,
    action: Types.Child.DismissAction,
    promise?: Promise<unknown>,
  ) => void;
}

export interface CreateStateInit {
  onOpen?:
    | ((descriptor: Types.Child.Descriptor<unknown, unknown>) => void)
    | undefined;
  onDismiss?:
    | ((
        descriptor: Types.Child.DescriptorAfterDismiss<unknown, unknown>,
      ) => void)
    | undefined;
}

export const DEFAULT_INTERNAL_STATE_INJECTION_KEY: Types.Scope = Symbol('');

export const createState = (init: CreateStateInit = {}): InternalState => {
  // We should not care about any possible changes in descriptors. Also `reactive`
  //  unwraps refs, but at least `requestedDismissAction` should be preserved as is.
  const children = shallowReactive(
    new Map<
      Types.Child.Descriptor.Key,
      Types.Child.Descriptor<unknown, unknown>
    >(),
  );

  const getChildByKey: InternalState['getChildByKey'] = (
    key: Types.Child.Descriptor.Key | undefined,
  ) => {
    if (key === undefined) return;

    return children.get(key);
  };

  const getChildrenByComponent: InternalState['getChildrenByComponent'] = (
    component: Component | undefined,
  ) => {
    if (component === undefined) return [];

    // TODO: remove `Iterator.from()` after fix
    //  https://github.com/vuejs/core/issues/12615
    return Iterator.from(children.values())
      .filter((it) => it.component === component)
      .toArray();
  };

  const isOpen: InternalState['isOpen'] = (
    key: Types.Child.Descriptor.Key | undefined,
  ) => {
    if (key === undefined) return false;
    const child = getChildByKey(key);
    return child !== undefined && !child.isDismissed;
  };

  const isOpenSimilar: InternalState['isOpenSimilar'] = (
    component: Component | undefined,
  ) => {
    if (component === undefined) return false;

    // TODO: remove `Iterator.from()` after fix
    //  https://github.com/vuejs/core/issues/12615
    return Iterator.from(children.values()).some(
      (it) => it.component === component && !it.isDismissed,
    );
  };

  const openChild: InternalState['openChild'] = <TData, TValue>(
    component: Types.Child<TData, TValue>,
    data: NoInfer<TData>,
    value: ShallowRef<NoInfer<TValue>>,
  ) => {
    // eslint-disable-next-line sonar/pseudo-random -- it's ok
    const key = Math.random().toString();

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
        calledAt: new Date(),
        dismissedAt: undefined,
      }) satisfies Types.Child.Descriptor<TData, TValue>;

    state.children.set(key, descriptor);

    init.onOpen?.(descriptor);

    return {
      key,
      resolutionPromise: resolutionPromise.promise,
    } as const;
  };

  const requestChildDismiss: InternalState['requestChildDismiss'] = (
    key: Types.Child.Descriptor.Key,
    action: Types.Child.DismissAction,
  ) => {
    // Make sure we have new object with new identity every time, regardless
    //  of what user have passed.
    const action_ = structuredClone(action);
    const descriptor = getChildByKey(key);

    if (descriptor === undefined) {
      if (import.meta.env.DEV)
        console.warn(
          '[ModalityLayout] You try to dismiss child which is not open yet!',
        );
      return;
    }

    if (descriptor.isDismissed) {
      if (import.meta.env.DEV)
        console.warn(
          '[ModalityLayout] You try to dismiss already dismissed child!',
        );
      return;
    }

    // Request for dismiss. This this not real dismiss, because this action can
    //  be discarded further.
    descriptor.requestedDismissAction = action_;
  };

  const dismissChild: InternalState['dismissChild'] = (
    key: Types.Child.Descriptor.Key,
    action: Types.Child.DismissAction,
    promise: Promise<unknown> = Promise.resolve(),
  ) => {
    const descriptor = getChildByKey(key);

    if (descriptor === undefined) {
      if (import.meta.env.DEV)
        console.warn('.dismissChild() was called for non-presented child!');
      return;
    }

    const updatedProperties = {
      isDismissed: true as const,
      dismissedAt: new Date(),
      requestedDismissAction: action,
    } as const satisfies Partial<
      Types.Child.DescriptorAfterDismiss<unknown, unknown>
    >;

    const descriptorAfterDismiss = Object.assign(
      descriptor,
      updatedProperties,
    ) satisfies Types.Child.DescriptorAfterDismiss<unknown, unknown>;

    descriptor.resolutionPromise.resolve({
      value: descriptorAfterDismiss.value,
      action,
    });

    init.onDismiss?.(descriptorAfterDismiss);

    void promise.then(() => void children.delete(key));
  };

  const state = {
    children,
    isOpen,
    isOpenSimilar,
    getChildByKey,
    getChildrenByComponent,
    openChild,
    requestChildDismiss,
    dismissChild,
  } as const satisfies InternalState;

  return state;
};
