import type { Except } from 'type-fest';
import type { ComponentProps } from 'vue-component-type-helpers';
import type { Component, Ref, VNodeProps, AllowedComponentProps } from 'vue';

export type MaybeReadonlyRefOrGetter<T> = T | Readonly<Ref<T>> | (() => T);

export type CustomComponentProps<C extends Component> = Except<
  ComponentProps<C>,
  keyof VNodeProps | keyof AllowedComponentProps
>;
