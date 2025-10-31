import type { ModalDismissAction } from './types';

export class RichCloseEvent extends Event {
  action: ModalDismissAction;
  promise: Promise<unknown> | undefined;

  constructor(action: ModalDismissAction, promise?: Promise<unknown>) {
    super('close', { bubbles: true });

    this.action = action;
    this.promise = promise;
  }
}

export class RichCancelEvent extends Event {
  action: ModalDismissAction;

  constructor(action: ModalDismissAction) {
    super('cancel', { bubbles: true, cancelable: true });

    this.action = action;
  }
}
