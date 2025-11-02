import { isRef } from 'vue';

import { isFunction } from './common';
import type { MaybeReadonlyRefOrGetterWithArgument } from './types';

export const toValueWithArgument = <T, TA>(
  source: MaybeReadonlyRefOrGetterWithArgument<T, TA>,
  argument: NoInfer<TA>,
): T => {
  if (isFunction(source)) return source(argument);
  if (isRef(source)) return source.value;

  return source;
};
