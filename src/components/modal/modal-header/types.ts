import type { Component } from 'vue';

// eslint-disable-next-line ts/no-namespace
export namespace Props {
  export interface Button {
    Icon: Component;
    onClick: () => void;
  }
}

export type Props = {
  title?: string;
  titleButton?: Props.Button;

  /**
   * Title for floating header which appear during scroll.
   * Same as `title` prop by default.
   */
  floatingHeaderTitle?: string;
  subtitle?: string;
  isBackShown?: boolean;
  cutIn?: boolean;

  // TODO(uikit/i18n): use uikit default translations
  backText?: string;

  buttons?: Props.Button[];
};

export type Emits = {
  close: [];
  back: [];
};

export type Slots = {
  cover?: () => unknown;
};
