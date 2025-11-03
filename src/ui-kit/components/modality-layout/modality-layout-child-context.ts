import type { InjectionKey } from 'vue';
import { defineComponent, provide, toRef } from 'vue';

import type { Types } from './modality-layout';

export const MODALITY_LAYOUT_CHILD_CONTEXT_KEY: InjectionKey<Types.Child.Context> =
  Symbol('ModalityLayoutChildContextKey');

export const ModalityLayoutChildContext = defineComponent<{
  descriptor: Types.Child.Descriptor<unknown, unknown>;
  stackIndex: number | undefined;
}>(
  (props, { slots }) => {
    // Since we don't care about changes in descriptor, there is no need to pass reactive value
    provide(MODALITY_LAYOUT_CHILD_CONTEXT_KEY, {
      descriptor: props.descriptor,
      stackIndex: toRef(() => props.stackIndex),
    });

    return () => slots['default']?.();
  },
  {
    props: ['descriptor', 'stackIndex'],
  },
);
