import type { InjectionKey, Ref } from 'vue';
import { defineComponent, provide, toRef } from 'vue';

import type { Types } from './modality-layout';

interface Data {
  descriptor: Types.Child.Descriptor<unknown, unknown>;
  stackIndex: Readonly<Ref<number | undefined>>;
}

export const ModalLayoutChildContextKey: InjectionKey<Data> = Symbol('');

export const ModalLayoutChildContext = defineComponent<{
  descriptor: Types.Child.Descriptor<unknown, unknown>;
  stackIndex: number | undefined;
}>(
  (props, { slots }) => {
    // Since we don't care about changes in descriptor, there is no need to pass reactive value
    provide(ModalLayoutChildContextKey, {
      descriptor: props.descriptor,
      stackIndex: toRef(() => props.stackIndex),
    });

    return () => slots['default']?.();
  },
  {
    props: ['descriptor', 'stackIndex'],
  },
);
