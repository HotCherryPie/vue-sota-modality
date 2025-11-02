import type { Except } from 'type-fest';
import type {
  Component,
  Ref,
  VNodeProps,
  AllowedComponentProps,
  InjectionKey,
} from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';

export type MaybeReadonlyRefOrGetter<T> = T | Readonly<Ref<T>> | (() => T);
export type MaybeReadonlyRefOrGetterWithArgument<T, TArgument> =
  | T
  | Readonly<Ref<T>>
  | ((argument: TArgument) => T);

export type CustomComponentProps<TComponent extends Component> = Except<
  ComponentProps<TComponent>,
  keyof VNodeProps | keyof AllowedComponentProps
>;

// eslint-disable-next-line ts/no-explicit-any
export type InferInjectionKeyData<T extends InjectionKey<any>> =
  T extends InjectionKey<infer I> ? I : never;
