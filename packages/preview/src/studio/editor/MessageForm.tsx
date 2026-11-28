import { useState, type ReactElement } from "react";
import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
  SwitchButton,
  SwitchField
} from "react-aria-components";
import { MessageFlag } from "@discordkit/client/messages/types/MessageFlag";
import { isComponentsV2 } from "../../components.js";
import { maxContentCharacters } from "../../lint/limits.js";
import type { Scene, SceneMessage } from "../../scene.js";
import controls from "../controls/Fields.module.css";
import { ConvertToScene } from "./ConvertToScene.js";
import { setValueAt } from "./edits.js";
import { useEditor } from "./EditorContext.js";
import {
  ListChoice,
  SwitchControl,
  TextAreaControl,
  TextControl,
  useSceneValue
} from "./fields.js";
import { switchKind, type MessageKind } from "./messageKind.js";
import { parsePathKey } from "./paths.js";
import styles from "./Form.module.css";
import dialog from "./KindDialog.module.css";

/**
 * A message's own fields: whether it is classic or Components V2, a classic message's text, the flags worth setting when sending, and, in a scene file, who sent it and how the preview draws it.
 */

/** The message at `name` (`messages.0`), typed, re-rendering when anything in it changes. */
const useMessage = (name: string): SceneMessage | undefined => {
  const { scene } = useEditor();
  // Subscribes to the message, so the form follows changes to it from anywhere (a JSON edit, a tree edit).
  useSceneValue(name);
  return scene().messages.at(Number(parsePathKey(name)[1]));
};

const kindOptions = [
  { id: `v2` as const, label: `Components V2` },
  { id: `classic` as const, label: `Classic` }
];

/** The flags a person sending a message chooses. The rest are set by Discord or mean a different kind of message; IS_COMPONENTS_V2 is the kind above. */
const sendFlags = [
  {
    flag: MessageFlag.SUPPRESS_NOTIFICATIONS,
    label: `Silent`,
    help: `Sends without a push or desktop notification (SUPPRESS_NOTIFICATIONS).`,
    classicOnly: false
  },
  {
    flag: MessageFlag.SUPPRESS_EMBEDS,
    label: `Hide link previews`,
    help: `Discord draws no embeds for links in the text (SUPPRESS_EMBEDS).`,
    classicOnly: true
  }
];

const FlagSwitch = ({
  name,
  flag,
  label,
  help
}: {
  name: string;
  flag: number;
  label: string;
  help: string;
}): ReactElement => {
  const { apply, disabledReason, fileKind } = useEditor();
  const flags = useSceneValue(name);
  const value = typeof flags === `number` ? flags : 0;
  return (
    <div className={styles.field} data-field-path={name}>
      <SwitchField
        isSelected={(value & flag) !== 0}
        isDisabled={
          disabledReason !== undefined ||
          fileKind === `components` ||
          fileKind === `component`
        }
        onChange={(on) => {
          const next = on ? value | flag : value & ~flag;
          const path = parsePathKey(name);
          // The message stays selected: `flags` is in its payload.
          apply((scene) =>
            setValueAt(
              scene,
              path,
              next === 0 ? undefined : next,
              path.slice(0, 2)
            )
          );
        }}
      >
        <SwitchButton className={controls.switch}>
          <span className={controls.track} />
          {label}
        </SwitchButton>
      </SwitchField>
      <p className={styles.help}>{help}</p>
    </div>
  );
};

/** The kind switch, with a warning that lists what will be lost before anything is. */
const KindControl = ({ name }: { name: string }): ReactElement => {
  const { apply, disabledReason, fileKind } = useEditor();
  const message = useMessage(name);
  const kind: MessageKind =
    message !== undefined && isComponentsV2(message.payload) ? `v2` : `classic`;
  const [pending, setPending] = useState<{
    to: MessageKind;
    discarded: string[];
  }>();
  const commit = (to: MessageKind): void => {
    const path = parsePathKey(name);
    apply((scene) => {
      const current = scene.messages.at(Number(path[1]));
      return setValueAt(
        scene,
        [...path, `payload`],
        current === undefined
          ? undefined
          : switchKind(current.payload, to).payload,
        path
      );
    });
  };
  // A bare component array has no flags of its own: intake adds the V2 flag when the components need it.
  const fixed = fileKind === `components` || fileKind === `component`;
  return (
    <>
      <ListChoice<MessageKind>
        label="Kind"
        value={kind}
        options={kindOptions}
        isDisabled={disabledReason !== undefined || fixed}
        help={
          fixed
            ? `The file holds only components, so the message is Components V2 whenever they need it. Make the file a scene or a message payload to choose.`
            : `Components V2 lays out containers, text and media; classic is text, embeds and rows of buttons. Discord refuses a message that mixes them.`
        }
        onChange={(to) => {
          if (to === kind || message === undefined) return;
          const { discarded } = switchKind(message.payload, to);
          if (discarded.length === 0) commit(to);
          else setPending({ to, discarded });
        }}
      />
      <ModalOverlay
        className={dialog.overlay}
        isOpen={pending !== undefined}
        onOpenChange={(open) => {
          if (!open) setPending(undefined);
        }}
        isDismissable
      >
        <Modal className={dialog.modal}>
          <Dialog role="alertdialog" className={dialog.dialog}>
            {({ close }) => (
              <>
                <Heading slot="title" className={dialog.title}>
                  Switch to{" "}
                  {pending?.to === `v2` ? `Components V2` : `a classic message`}
                  ?
                </Heading>
                <p className={dialog.text}>
                  {pending?.to === `v2`
                    ? `A Components V2 message cannot have text or embeds of its own, so switching removes:`
                    : `A classic message holds only rows of buttons and selects, so switching removes:`}
                </p>
                <ul className={dialog.list}>
                  {pending?.discarded.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className={dialog.text}>
                  {pending?.to === `v2`
                    ? `To keep the text, copy it into a Text Display first.`
                    : `Action rows are kept.`}
                  {` `}
                  {`Undo brings it back.`}
                </p>
                <div className={dialog.actions}>
                  {/* oxlint-disable-next-line jsx-a11y/no-autofocus -- an alert dialog starts on its least destructive choice. */}
                  <Button className={dialog.cancel} onPress={close} autoFocus>
                    Keep it as it is
                  </Button>
                  <Button
                    className={dialog.confirm}
                    onPress={() => {
                      if (pending !== undefined) commit(pending.to);
                      close();
                    }}
                  >
                    Switch and remove
                  </Button>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
};

/** The author choice for no author. Not a user id, which is a number. */
const noAuthor = `none`;

const AuthorControl = ({ name }: { name: string }): ReactElement => {
  const { scene, apply, disabledReason, fileKind, fileName, convertToScene } =
    useEditor();
  const author = useSceneValue(`${name}.author`);
  const users: NonNullable<NonNullable<Scene[`context`]>[`users`]> =
    scene().context?.users ?? {};
  const options = [
    { id: noAuthor, label: `None`, detail: `Drawn as an app named "App"` },
    ...Object.entries(users).map(([id, user]) => ({
      id,
      label: user.name,
      detail: `${id}${user.bot === true ? ` · app` : ``}`
    }))
  ];
  const sceneFile = fileKind === `scene`;
  return (
    <>
      <ListChoice
        label="Author"
        fieldPath={`${name}.author`}
        value={typeof author === `string` ? author : noAuthor}
        options={
          typeof author === `string` && !(author in users)
            ? [
                ...options,
                {
                  id: author,
                  label: author,
                  detail: `Not in the scene's users`
                }
              ]
            : options
        }
        isDisabled={disabledReason !== undefined || !sceneFile}
        help={
          sceneFile
            ? `Who sent it, from the scene's users, which are defined in the Surroundings tab.`
            : `Not in this file: it holds a bare payload, which has no author, and only one message. Make it a scene to set one, or to add messages.`
        }
        onChange={(id) => {
          const path = parsePathKey(name);
          apply((current) =>
            setValueAt(
              current,
              [...path, `author`],
              id === noAuthor ? undefined : id,
              path
            )
          );
        }}
      />
      <ConvertToScene
        fileKind={fileKind}
        fileName={fileName}
        onConvert={convertToScene}
        isDisabled={disabledReason !== undefined}
      />
    </>
  );
};

export const MessageForm = ({ name }: { name: string }): ReactElement => {
  const { fileKind } = useEditor();
  const message = useMessage(name);
  const v2 = message !== undefined && isComponentsV2(message.payload);
  const sceneFile = fileKind === `scene`;
  return (
    <>
      <KindControl name={name} />
      {v2 ? null : (
        <TextAreaControl
          name={`${name}.payload.content`}
          label="Text"
          optional
          rows={5}
          help={`The message's own text, in markdown. Up to ${String(maxContentCharacters)} characters.`}
        />
      )}
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Flags</legend>
        {sendFlags
          .filter((entry) => !(entry.classicOnly && v2))
          .map((entry) => (
            <FlagSwitch
              key={entry.flag}
              name={`${name}.payload.flags`}
              flag={entry.flag}
              label={entry.label}
              help={entry.help}
            />
          ))}
      </fieldset>
      <AuthorControl name={name} />
      {sceneFile ? (
        <fieldset className={styles.group}>
          <legend className={styles.legend}>How the preview draws it</legend>
          <SwitchControl
            name={`${name}.ephemeral`}
            label="Ephemeral"
            help={`Tinted, with "Only you can see this" under it, as an ephemeral reply is.`}
          />
          <SwitchControl
            name={`${name}.edited`}
            label="Edited"
            help={`Marked "(edited)".`}
          />
          <TextControl
            name={`${name}.timestamp`}
            label="Sent at"
            optional
            code
            placeholder="The scene's clock"
            help="An ISO 8601 date and time. It decides the header's time and whether the message joins the one above it."
          />
        </fieldset>
      ) : null}
    </>
  );
};
