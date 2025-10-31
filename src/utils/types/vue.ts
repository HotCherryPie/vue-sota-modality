import type { Except } from 'type-fest';
import type { Component, Ref, VNodeProps, AllowedComponentProps } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';

export type MaybeReadonlyRefOrGetter<T> = T | Readonly<Ref<T>> | (() => T);

export type CustomComponentProps<TComponent extends Component> = Except<
  ComponentProps<TComponent>,
  keyof VNodeProps | keyof AllowedComponentProps
>;
