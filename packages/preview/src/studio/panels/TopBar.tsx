import type { ReactElement, ReactNode } from "react";
import { FileTrigger } from "react-aria-components";
import { QuietButton } from "../controls/Buttons.js";
import { LintState, type OverallState } from "./LintState.js";
import styles from "./TopBar.module.css";

/** How the document stands against the file, in a few words, and whether it needs attention. */
export interface SyncStatus {
  tone: `quiet` | `attention` | `problem`;
  text: string;
}

export interface TopBarProps {
  /** The file's name, or "Draft". */
  title: string;
  /** The file's full path, when there is one. */
  path: string | undefined;
  status: SyncStatus;
  overall: OverallState;
  /** Draft mode: import a file's text, and export the draft. */
  onImport?: (text: string, name: string) => void;
  onExport?: () => void;
  /** Undo, redo and the history, and the PNG export: before the status. */
  children?: ReactNode;
}

const jsonTypes = [`application/json`, `.json`];

const toneClass = {
  quiet: styles.statusQuiet,
  attention: styles.statusAttention,
  problem: styles.statusProblem
};

export const TopBar = ({
  title,
  path,
  status,
  overall,
  onImport,
  onExport,
  children
}: TopBarProps): ReactElement => {
  let actions: ReactNode = null;
  if (onImport !== undefined && onExport !== undefined) {
    const importFile = async (files: FileList | null): Promise<void> => {
      const file = files?.[0];
      if (file === undefined) return;
      onImport(await file.text(), file.name);
    };
    actions = (
      <div className={styles.actions}>
        <FileTrigger
          acceptedFileTypes={jsonTypes}
          onSelect={(files) => void importFile(files)}
        >
          <QuietButton>Import file…</QuietButton>
        </FileTrigger>
        <QuietButton onPress={onExport}>Export</QuietButton>
      </div>
    );
  }
  return (
    <header className={styles.bar}>
      <div className={styles.identity}>
        <span className={styles.product}>
          discordkit-preview <span className={styles.productName}>Studio</span>
        </span>
        <span className={styles.divider} aria-hidden="true" />
        <h1 className={styles.title} title={path}>
          {title}
        </h1>
        {path === undefined ? null : (
          <span className={styles.path} title={path}>
            {path}
          </span>
        )}
      </div>
      <div className={styles.state}>
        {children}
        {/* An `output` is a polite live region, so a change of status is announced without moving focus. */}
        <output className={toneClass[status.tone]}>{status.text}</output>
        <LintState overall={overall} />
        {actions}
      </div>
    </header>
  );
};
