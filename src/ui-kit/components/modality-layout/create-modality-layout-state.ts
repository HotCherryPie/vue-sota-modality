import { createState } from './modality-layout';
import type { Types } from './modality-layout';

export const createModalityLayoutState = (): Types.Props.ExternalState => {
  const state = createState();

  return state;
};
