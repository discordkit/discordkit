import type { ReactElement } from "react";
import { Button } from "react-aria-components";
import type { InputKind } from "../../scene/intake.js";
import { InfoIcon } from "../controls/icons.js";
import { unknownAt, type UnknownReference } from "./contextUsage.js";
import { useEditor } from "./EditorContext.js";
import styles from "./Surroundings.module.css";

/** What the preview draws for something the scene uses but does not describe, and why, in one sentence. */
export const referenceText = (reference: UnknownReference): string => {
  const { kind, key } = reference;
  const authorOnly = reference.uses.every((use) => use.how === `author`);
  switch (kind) {
    case `users`:
      return authorOnly
        ? `The author ${key} is not among the scene's users, so the message is drawn as sent by "unknown-user".`
        : `<@${key}> is drawn as @unknown-user: the scene does not say who user ${key} is.`;
    case `roles`:
      return `<@&${key}> is drawn as @deleted-role: the scene does not say what role ${key} is.`;
    case `channels`:
      return `<#${key}> is drawn as #unknown: the scene does not say what channel ${key} is.`;
    case `emoji`:
      return `The custom emoji ${reference.name === undefined ? key : `:${reference.name}:`} is drawn from Discord's CDN by its id, which needs the network and shows nothing for an emoji that does not exist. Give it an image in the scene to be sure what is drawn.`;
    case `attachments`:
      return `attachment://${key} is drawn as an empty placeholder: the scene lists no file called ${key}.`;
  }
};

/** The one action that starts describing it, as the button says it. */
export const defineLabel = (reference: UnknownReference): string => {
  const { kind, key } = reference;
  switch (kind) {
    case `users`:
      return `Define user ${key}`;
    case `roles`:
      return `Define role ${key}`;
    case `channels`:
      return `Define channel ${key}`;
    case `emoji`:
      return `Describe emoji ${reference.name === undefined ? key : `:${reference.name}:`}`;
    case `attachments`:
      return `Name the file ${key}`;
  }
};

/** One unknown reference with its action: defining it in a scene file, or, in a file that has nowhere to put it, saying so. */
export const UnknownNote = ({
  reference,
  fileKind,
  onDefine,
  isDisabled
}: {
  reference: UnknownReference;
  fileKind: InputKind | undefined;
  onDefine: (reference: UnknownReference) => void;
  isDisabled: boolean;
}): ReactElement => (
  <li className={styles.unknown}>
    <InfoIcon className={styles.unknownIcon} />
    <span className={styles.unknownText}>
      {referenceText(reference)}
      {fileKind === `scene` ? null : (
        <>
          {` `}
          This file holds a bare payload, with nowhere to describe it: make it a
          scene first.
        </>
      )}
    </span>
    {fileKind === `scene` ? (
      <Button
        className={styles.defineButton}
        onPress={() => onDefine(reference)}
        isDisabled={isDisabled}
      >
        {defineLabel(reference)}
      </Button>
    ) : null}
  </li>
);

/** The unknown references used in one field, under it, each with the one action that starts describing it. */
export const UnknownNotes = ({
  name
}: {
  name: string;
}): ReactElement | null => {
  const { report, fileKind, define, disabledReason } = useEditor();
  const references = unknownAt(report, name);
  if (references.length === 0) return null;
  return (
    <ul className={styles.unknownList}>
      {references.map((reference) => (
        <UnknownNote
          key={`${reference.kind}:${reference.key}`}
          reference={reference}
          fileKind={fileKind}
          onDefine={define}
          isDisabled={disabledReason !== undefined}
        />
      ))}
    </ul>
  );
};
