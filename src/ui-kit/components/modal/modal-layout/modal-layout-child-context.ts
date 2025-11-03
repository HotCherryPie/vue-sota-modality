import type { InjectionKey, Ref } from 'vue';
import { defineComponent, provide, toRef } from 'vue';

import type { ModalViewDescriptor } from './types';

interface Data extends ModalViewDescriptor {
  stackIndex: Readonly<Ref<number | undefined>>;
}

export const ModalLayoutChildContextKey: InjectionKey<Data> = Symbol('');

export const ModalLayoutChildContext = defineComponent<{
  descriptor: ModalViewDescriptor;
  stackIndex: number | undefined;
}>(
  (props, { slots }) => {
    // Since we don't care about changes in descriptor, there is no need to pass reactive value
    provide(ModalLayoutChildContextKey, {
      ...props.descriptor,
      stackIndex: toRef(() => props.stackIndex),
    });

    return () => slots['default']?.();
  },
  {
    props: ['descriptor', 'stackIndex'],
  },
);
