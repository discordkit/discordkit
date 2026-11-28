import { createContext, useContext } from "react";
import type { Control } from "react-hook-form";
import type { InputKind } from "../../scene/intake.js";
import type { Path } from "../../findings.js";
import type { Scene, SceneContext } from "../../scene.js";
import type { Backend } from "../backend/backend.js";
import type { StepInfo } from "../document/documentState.js";
import type { ContextReport, UnknownReference } from "./contextUsage.js";
import type { EditResult } from "./edits.js";

/**
 * What every bound field in the structured editor needs: the form's control, a way to write the scene to the file after a change, and whether editing is allowed at all.
 *
 * A component's fields are reached by paths built at run time (`messages.0.payload.components.2.label`); `fieldPath` in `paths.ts` checks each one and gives it react-hook-form's path type for the scene. The names are scene paths, which is what keeps them in step with lint.
 */
export interface Editor {
  control: Control<Scene>;
  /** Writes the form's scene to the file, if it changed, and re-runs lint so every field's findings are current. Call after every change. `step` names the change in the history. */
  write: (step?: StepInfo) => void;
  /** Why the form cannot be edited now, or undefined when it can. */
  disabledReason: string | undefined;
  /** What the file holds. A bare payload or component array has no place for some fields (the author, the message's flags), so the forms say so rather than offer them. */
  fileKind: Exclude<InputKind, `unknown`>;
  /** The scene as the form holds it now, cleared fields pruned. */
  scene: () => Scene;
  /** Applies an edit (see `edits.ts`) to the form, writes it, and moves the selection with it. A change wider than one field (a button's style, a message's kind) goes through here too, as `setValueAt`. */
  apply: (edit: (scene: Scene) => EditResult, label?: string) => void;
  /** The file's name, for saying what an action will do to it. */
  fileName: string;
  /** Rewrites a file holding a bare payload as a scene holding it (see `toSceneText`). Only ever called when the person confirms it. */
  convertToScene: () => void;
  /** Where the scene uses its surroundings, and what it uses that they do not define. */
  report: ContextReport;
  /** Changes the scene's context and writes it. */
  setContext: (
    change: (context: SceneContext | undefined) => SceneContext | undefined,
    step?: StepInfo
  ) => void;
  /** Starts an entry for something the scene uses but does not define, and takes the person to it. */
  define: (reference: UnknownReference) => void;
  /** Selects what is at a scene path in the tree and puts the cursor in its field, as choosing a finding does. */
  goTo: (path: Path) => void;
  /** Where a scene path is, in words: "Message 2 › Text Display". */
  placeName: (path: Path) => string;
  /** Whether the bridge can serve a listed attachment, where there is a bridge. */
  checkAttachment: Backend[`checkAttachment`];
  /** The URL an attachment is served at, or null where none can be. */
  attachmentUrl: Backend[`attachmentUrl`];
  /** The file's version on disk, so a check can be made again once a change is saved. */
  diskVersion: string | undefined;
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
