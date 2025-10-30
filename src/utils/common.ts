export const isNil = (e: unknown): e is undefined | null => e == null;

export const noop = () => {};

export const cloneEvent = <const T extends Event>(
  event: T,
  init: EventInit,
): T => {
  return new (event as any).constructor(event.type, {
    ...event,
    bubbles: event.bubbles,
    cancelable: event.cancelable,
    composed: event.composed,
    ...init,
  }) as T;
};
