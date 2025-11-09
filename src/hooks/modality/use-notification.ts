import type { If, IsNever } from 'type-fest';
import { shallowRef } from 'vue';

import { useModalityLayoutApi } from '../../ui-kit';
import type { ModalityLayout } from '../../ui-kit';

import { notificationsScope } from './scopes';

type IfNever<T, TYes, TNo> = If<IsNever<T>, TYes, TNo>;
type IfUndefined<T, TYes, TNo> = undefined extends T ? TYes : TNo;

export const useNotification = <TData>(
  component: ModalityLayout.Types.Child<TData>,
) => {
  const api = useModalityLayoutApi(notificationsScope);

  if (api === undefined)
    throw new Error('<ModalityLayout> is missing in current scope!');

  type ShowFunctionArguments = IfNever<
    TData,
    [],
    IfUndefined<TData, [data?: TData], [data: TData]>
  >;

  const show = (...[data]: ShowFunctionArguments) => {
    // eslint-disable-next-line ts/no-non-null-assertion, ts/no-unsafe-type-assertion
    api.openChild(component, data!, shallowRef(undefined as never));
  };

  return { show };
};
