import { createContext, useContext } from "react";
import type { ModalValue } from "../scene.js";

/**
 * What every field in a modal reads about the modal it is in: what the scene says has been filled in, and whether Submit has been pressed, which shows the errors. Internal: not exported from `@discordkit/preview/react`.
 */
export interface ModalState {
  values: Readonly<Record<string, ModalValue>> | undefined;
  submitted: boolean;
}

export const ModalContext = createContext<ModalState>({
  values: undefined,
  submitted: false
});

export const useModalState = (): ModalState => useContext(ModalContext);
