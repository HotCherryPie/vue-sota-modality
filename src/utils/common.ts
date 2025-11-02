// eslint-disable-next-line unicorn/no-null -- it's fine
export const isNil = (it: unknown): it is undefined | null => it == null;

// eslint-disable-next-line ts/no-unsafe-function-type -- it's fine
export const isFunction = (value: unknown): value is Function =>
  typeof value === 'function';

export const noop = () => {};

export const cloneEvent = <const T extends Event>(
  event: T,
  init: EventInit,
): T => {
  // eslint-disable-next-line ts/no-unsafe-type-assertion, ts/no-unsafe-call, ts/no-unsafe-member-access, ts/no-explicit-any -- it's fine
  return new (event as any).constructor(event.type, {
    // eslint-disable-next-line ts/no-misused-spread -- it's fine
    ...event,
    bubbles: event.bubbles,
    cancelable: event.cancelable,
    composed: event.composed,
    ...init,
  }) as T;
};
