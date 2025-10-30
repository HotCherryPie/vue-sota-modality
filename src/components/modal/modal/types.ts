import type {
  ModalDismissActionIntent,
  ModalDismissSourceDescription,
} from '../modal-layout/types';

export type Props = {
  // Why not use always scrollable behavior by default? `overflow: auto` clips any content that
  //  extends beyond the bounds of the container, which not always desireable behavior
  /**
   * Makes content of modal scrollable
   * @defaultValue `false`
   */
  scrollable?: boolean;

  /**
   * Defines height of the modal
   * - `auto` — takes height of the content
   * - `expanded` — take maximum available height
   * @defaultValue `auto`
   */
  detent?: 'auto' | 'expanded';

  /**
   * Affects maximum width of the modal.
   * @defaultValue `small`
   */
  size?: 'small' | 'large';
};

export type Slots = {
  default: (props: {
    dismiss: (
      intent: ModalDismissActionIntent,
      description?: ModalDismissSourceDescription,
    ) => void;
  }) => unknown;
};
