import { createContext, useContext } from "react";
import type { LayoutId } from "../devices.js";

/**
 * Which client's layout the scene is drawn with (see `layouts` in `devices.ts`).
 *
 * Most of what differs between layouts is styling, and lives in each component's stylesheet under `[data-discordkit-preview-layout="ios"]`, which the scene element carries. This context is for the few places where the markup itself differs: the iOS gallery's table of arrangements and the ALT badge it draws on a described picture. Internal: not exported from `@discordkit/preview/react`.
 */
export const LayoutContext = createContext<LayoutId>(`desktop`);

/** The layout the enclosing scene is drawn with. */
export const useLayout = (): LayoutId => useContext(LayoutContext);
