import { createContext, useContext } from "react";
import type { Control } from "react-hook-form";
import type { InputKind } from "../../scene/intake.js";
import type { Scene } from "../../scene.js";
import type { EditResult } from "./edits.js";

/**
 * What every bound field in the structured editor needs: the form's control, a way to write the scene to the file after a change, and whether editing is allowed at all.
 *
 * A component's fields are reached by paths built at run time (`messages.0.payload.components.2.label`); `fieldPath` in `paths.ts` checks each one and gives it react-hook-form's path type for the scene. The names are scene paths, which is what keeps them in step with lint.
 */
export interface Editor {
  control: Control<Scene>;
  /** Writes the form's scene to the file, if it changed, and re-runs lint so every field's findings are current. Call after every change. */
  write: () => void;
  /** Why the form cannot be edited now, or undefined when it can. */
  disabledReason: string | undefined;
  /** What the file holds. A bare payload or component array has no place for some fields (the author, the message's flags), so the forms say so rather than offer them. */
  fileKind: Exclude<InputKind, `unknown`>;
  /** The scene as the form holds it now, cleared fields pruned. */
  scene: () => Scene;
  /** Applies an edit (see `edits.ts`) to the form, writes it, and moves the selection with it. A change wider than one field (a button's style, a message's kind) goes through here too, as `setValueAt`. */
  apply: (edit: (scene: Scene) => EditResult) => void;
}

export const EditorContext = createContext<Editor | null>(null);

export const useEditor = (): Editor => {
  const editor = useContext(EditorContext);
  if (editor === null) {
    throw new Error(
      `A Studio form field was drawn outside the editor, so it has no form to read or write. Render it inside <EditorContext value={…}>.`
    );
  }
  return editor;
};
