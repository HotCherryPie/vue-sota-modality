import type { ModalityLayout } from '../../ui-kit';

export declare namespace Types {
  export namespace Props {
    export type Detent = 'auto' | 'expanded';
  }

  export interface Props {
    // Why not use always scrollable behavior by default? `overflow: auto` clips any content that
    //  extends beyond the bounds of the container, which not always desirable behavior
    /**
     * Makes content of modal scrollable
     * @defaultValue `true`
     */
    scrollable?: boolean | undefined;

    /**
     * Defines height of the modal
     * - `auto` — takes height of the content
     * - `expanded` — take maximum available height
     * @defaultValue `auto`
     */
    detent?: Props.Detent | undefined;
  }

  export interface Slots {
    default: (props: {
      dismiss: (action: ModalityLayout.Types.Child.DismissAction) => void;
    }) => unknown;
  }
}
