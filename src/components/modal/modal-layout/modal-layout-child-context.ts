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
}>(
  (props, { slots }) => {
    // Since we don't care about changes in descriptor, there is no need to pass reactive value
    provide(ModalLayoutChildContextKey, {
      ...props.descriptor,
      active: toRef(() => props.active),
    });

    return () => slots['default']?.();
  },
  {
    props: ['descriptor', 'active'],
  },
);
