import type { InjectionKey, Ref } from 'vue';
import { defineComponent, provide, toRef } from 'vue';

import type { ModalViewDescriptor } from './types';

type Data = ModalViewDescriptor & {
  active: Readonly<Ref<boolean>>;
};

export const ModalLayoutChildContextKey: InjectionKey<Data> = Symbol('');

export const ModalLayoutChildContext = defineComponent<{
  descriptor: ModalViewDescriptor;
  active: boolean;
}>({
  // `as unknown as undefined` used to force tooling look at types from generic
  props: ['descriptor', 'active'] as unknown as undefined,

  setup(props, { slots }) {
    // Since we don't care about changes in descriptor, there is no need to pass reactive value
    provide(ModalLayoutChildContextKey, {
      ...props.descriptor,
      active: toRef(() => props.active),
    });

    return () => slots.default?.();
  },
});
