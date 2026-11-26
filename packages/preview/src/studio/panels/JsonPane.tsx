import { useLayoutEffect, useRef, type ReactElement } from "react";
import { Label, Text, TextArea, TextField } from "react-aria-components";
import { PrimaryButton, QuietButton } from "../controls/Buttons.js";
import type { JsonError } from "../document/jsonError.js";
import styles from "./JsonPane.module.css";

/**
 * What Studio shows when the file changed on disk while the person had unsaved edits, from the JSON pane or the forms: their text is kept, the file's version is shown, and they choose. It sits above every tab, so it is seen wherever the person was editing.
 */
export const ConflictBanner = ({
  fileName,
  onLoadFile,
  onKeepMine,
  canKeepMine
}: {
  /** The file's name, for the banner. */
  fileName: string;
  onLoadFile: () => void;
  onKeepMine: () => void;
  /** False while the person's text does not parse, which cannot be written. */
  canKeepMine: boolean;
}): ReactElement => (
  <div role="alert" className={styles.conflict}>
    <p className={styles.conflictText}>
      <strong>
        {fileName} changed on disk while you had unsaved edits here.
      </strong>
      {` `}
      The preview, findings, code and forms now show the file. Your version is
      still in the JSON pane and has not been saved; saving is paused until you
      choose.
    </p>
    <div className={styles.conflictActions}>
      <QuietButton onPress={onLoadFile}>
        Discard mine, load the file
      </QuietButton>
      <PrimaryButton onPress={onKeepMine} isDisabled={!canKeepMine}>
        Overwrite the file with mine
      </PrimaryButton>
    </div>
  </div>
);

export interface JsonPaneProps {
  text: string;
  onChange: (text: string) => void;
  /** Where the text stops being JSON, if it does. */
  error: JsonError | undefined;
  /** Whether the text is written somewhere: false while nothing has loaded. */
  isDisabled: boolean;
}

/**
 * The scene as JSON text, editable. Every change that parses updates the preview and is written to the file; text that does not parse stays here, with where and why, and the preview keeps the last scene that did.
 */
export const JsonPane = ({
  text,
  onChange,
  error,
  isDisabled
}: JsonPaneProps): ReactElement => {
  const area = useRef<HTMLTextAreaElement>(null);
  const typed = useRef(text);

  // When the text is replaced from outside (the file changed) while the person has the pane focused, keep their caret where it was rather than throwing it to the end.
  const selection = useRef<[number, number]>([0, 0]);
  useLayoutEffect(() => {
    const element = area.current;
    if (element === null || typed.current === text) return;
    typed.current = text;
    if (document.activeElement !== element) return;
    const [start, end] = selection.current;
    element.setSelectionRange(
      Math.min(start, text.length),
      Math.min(end, text.length)
    );
  }, [text]);

  const goToError = (): void => {
    const element = area.current;
    if (element === null || error === undefined) return;
    element.focus();
    element.setSelectionRange(
      error.offset,
      Math.min(error.offset + 1, text.length)
    );
  };

  return (
    <div className={styles.pane}>
      <TextField
        className={styles.field}
        value={text}
        onChange={(next) => {
          typed.current = next;
          onChange(next);
        }}
        isInvalid={error !== undefined}
        isDisabled={isDisabled}
      >
        <Label className={styles.label}>Scene JSON</Label>
        <TextArea
          ref={area}
          className={styles.textarea}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          onSelect={(event) => {
            const element = event.currentTarget;
            selection.current = [element.selectionStart, element.selectionEnd];
          }}
        />
        {error === undefined ? null : (
          <Text slot="errorMessage" className={styles.error}>
            <span>
              <strong>
                Line {error.line}, column {error.column}:
              </strong>
              {` `}
              {error.message} Not saved until it parses; the preview shows the
              last version that did.
            </span>
          </Text>
        )}
      </TextField>
      {error === undefined ? null : (
        <div className={styles.errorActions}>
          <QuietButton onPress={goToError}>Go to line {error.line}</QuietButton>
        </div>
      )}
    </div>
  );
};
