import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode
} from "react";
import { useWatch } from "react-hook-form";
import {
  Button,
  ColorField,
  Input,
  Label,
  NumberField,
  SwitchButton,
  SwitchField,
  Text,
  TextField
} from "react-aria-components";
import type { SceneContext } from "../../scene.js";
import type { AttachmentStatus } from "../backend/backend.js";
import { PlusIcon, RemoveIcon } from "../controls/icons.js";
import controls from "../controls/Fields.module.css";
import { colorToHexOrUndefined, hexToColor } from "./color.js";
import {
  newEntry,
  usesOf,
  withEntry,
  withField,
  type ContextKind,
  type ContextUse
} from "./contextUsage.js";
import { ConvertToScene } from "./ConvertToScene.js";
import { useEditor } from "./EditorContext.js";
import { UnknownNote } from "./UnknownNotes.js";
import form from "./Form.module.css";
import styles from "./Surroundings.module.css";

/**
 * The scene's surroundings: the users, roles, channels and custom emoji that mentions and authors resolve to, and the files `attachment://` names. Each entry says where the scene uses it, and one nothing uses is marked, so it is easy to spot and remove. What the scene uses but does not describe is listed first, each with the one action that starts its entry.
 *
 * Entries are keyed by an id, or a file name, that may hold dots or be a snowflake too long for a JavaScript number, so they are not form fields at paths: each is read from the form's context and written whole with `withEntry`.
 */

export interface SurroundingsPanelProps {
  /** An entry to move the cursor to once drawn: one just started from an unknown reference. */
  focusEntry: { kind: ContextKind; key: string; at: number } | undefined;
}

type Entry = Record<string, unknown>;

const kindNames: Record<ContextKind, { one: string; title: string }> = {
  users: { one: `user`, title: `Users` },
  roles: { one: `role`, title: `Roles` },
  channels: { one: `channel`, title: `Channels` },
  emoji: { one: `emoji`, title: `Custom emoji` },
  attachments: { one: `file`, title: `Attachments` }
};

const kindHelp: Record<ContextKind, string> = {
  users: `The message authors, and who <@id> mentions and user selects name. An id with no entry is drawn as @unknown-user.`,
  roles: `What <@&id> mentions and role selects name. An id with no entry is drawn as @deleted-role.`,
  channels: `What <#id> mentions and channel selects name. An id with no entry is drawn as #unknown.`,
  emoji: `Images for custom emoji (<:name:id>, and on buttons and options). Without one, the emoji is fetched from Discord's CDN by its id.`,
  attachments: `Files on disk that attachment://name draws: pictures, thumbnails, files and avatars. The studio command serves only image files listed here, read-only.`
};

const howNames: Record<ContextUse[`how`], string> = {
  author: `author`,
  mention: `mention`,
  emoji: `emoji`,
  "default value": `default value`,
  image: `image`,
  avatar: `avatar`
};

const asEntry = (value: unknown): Entry =>
  typeof value === `object` && value !== null ? { ...value } : {};

const text = (entry: Entry, field: string): string =>
  typeof entry[field] === `string` ? entry[field] : ``;

/** A text field for one of an entry's fields. Required fields keep an empty string; optional ones are removed when cleared. */
const EntryText = ({
  label,
  value,
  onChange,
  help,
  code = false,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: ReactNode;
  code?: boolean;
  placeholder?: string;
}): ReactElement => (
  <TextField className={form.field} value={value} onChange={onChange}>
    <Label className={form.label}>{label}</Label>
    <Input
      className={code ? `${controls.input} ${controls.code}` : controls.input}
      spellCheck={!code}
      autoComplete="off"
      placeholder={placeholder}
    />
    {help === undefined ? null : (
      <Text slot="description" className={form.help}>
        {help}
      </Text>
    )}
  </TextField>
);

const EntrySwitch = ({
  label,
  isSelected,
  onChange
}: {
  label: string;
  isSelected: boolean;
  onChange: (value: boolean) => void;
}): ReactElement => (
  <SwitchField isSelected={isSelected} onChange={onChange}>
    <SwitchButton className={controls.switch}>
      <span className={controls.track} />
      {label}
    </SwitchButton>
  </SwitchField>
);

/** Where an entry is used, each place a link to it in the editor, or that nothing uses it. */
const Uses = ({
  uses,
  onRemove,
  name
}: {
  uses: readonly ContextUse[];
  onRemove: () => void;
  name: string;
}): ReactElement => {
  const { goTo, placeName } = useEditor();
  if (uses.length === 0) {
    return (
      <div className={styles.unused}>
        <span>
          <strong>Unused.</strong> Nothing in the scene names it.
        </span>
        <Button className={form.quietButton} onPress={onRemove}>
          Remove {name}
        </Button>
      </div>
    );
  }
  return (
    <p className={styles.uses}>
      <span className={styles.usesLabel}>Used by</span>
      {` `}
      {uses.map((use, index) => (
        <span key={`${String(index)}:${use.path.join(`.`)}`}>
          {index === 0 ? null : `, `}
          {use.path[0] === `messages` ? (
            <Button className={styles.place} onPress={() => goTo(use.path)}>
              {placeName(use.path)}
            </Button>
          ) : (
            placeName(use.path)
          )}
          {` `}
          <span className={styles.how}>({howNames[use.how]})</span>
        </span>
      ))}
    </p>
  );
};

/** Whether the studio command can serve a listed file, checked again each time the file on disk changes. */
const AttachmentCheck = ({
  name,
  path
}: {
  name: string;
  path: string;
}): ReactElement => {
  const { checkAttachment, attachmentUrl, diskVersion } = useEditor();
  // The answer for one name, path and version of the file; any other is still being checked.
  const asked = `${name}\n${path}\n${diskVersion ?? ``}`;
  const [answer, setAnswer] = useState<{
    asked: string;
    status: AttachmentStatus;
  }>();
  useEffect(() => {
    if (checkAttachment === undefined) return;
    let live = true;
    const check = async (): Promise<void> => {
      const status = await checkAttachment(name);
      if (live) setAnswer({ asked, status });
    };
    // A moment's pause, so a path being typed is checked once it settles and has been saved.
    const timer = setTimeout(() => void check(), 300);
    return (): void => {
      live = false;
      clearTimeout(timer);
    };
  }, [checkAttachment, name, asked]);
  if (checkAttachment === undefined) {
    return (
      <output className={styles.checkProblem}>
        Not checked: this is a draft kept in the browser, which cannot read
        files on disk. Run <code>discordkit-preview studio &lt;file&gt;</code>{" "}
        to have them served.
      </output>
    );
  }
  const status = answer?.asked === asked ? answer.status : undefined;
  if (status === undefined) {
    return (
      <output className={styles.checking}>
        Checking whether the studio command can serve it…
      </output>
    );
  }
  if (!status.served) {
    return (
      <output className={styles.checkProblem}>
        <strong>Cannot be served.</strong> {status.reason}
      </output>
    );
  }
  const url = attachmentUrl(name);
  return (
    <output className={styles.checkOk}>
      {url === null ? null : (
        <img
          className={styles.thumbnail}
          src={`${url}?path=${encodeURIComponent(path)}`}
          alt=""
        />
      )}
      <span>
        <strong>Served</strong> as {status.type},{` `}
        {new Intl.NumberFormat(undefined, {
          style: `unit`,
          unit: `kilobyte`,
          maximumFractionDigits: 1
        }).format(status.bytes / 1000)}
        .
      </span>
    </output>
  );
};

const EntryFields = ({
  kind,
  name,
  entry,
  update
}: {
  kind: ContextKind;
  name: string;
  entry: Entry;
  update: (field: string, value: unknown) => void;
}): ReactElement => {
  switch (kind) {
    case `users`:
      return (
        <>
          <EntryText
            label="Name"
            value={text(entry, `name`)}
            onChange={(value) => update(`name`, value)}
            help="Shown in the message header and in mentions."
          />
          <EntryText
            label="Avatar"
            code
            value={text(entry, `avatar`)}
            onChange={(value) =>
              update(`avatar`, value === `` ? undefined : value)
            }
            placeholder="None: a circle with the initial"
            help="An image URL, or attachment://name for a file listed under Attachments."
          />
          <div className={styles.switches}>
            <EntrySwitch
              label="App"
              isSelected={entry.bot === true}
              onChange={(on) => update(`bot`, on ? true : undefined)}
            />
            <EntrySwitch
              label="Verified"
              isSelected={entry.verified === true}
              onChange={(on) => update(`verified`, on ? true : undefined)}
            />
          </div>
        </>
      );
    case `roles`:
      return (
        <>
          <EntryText
            label="Name"
            value={text(entry, `name`)}
            onChange={(value) => update(`name`, value)}
          />
          <ColorField
            className={form.field}
            value={
              colorToHexOrUndefined(
                typeof entry.color === `number` ? entry.color : undefined
              ) ?? null
            }
            onChange={(color) =>
              update(
                `color`,
                color === null ? undefined : hexToColor(color.toString(`hex`))
              )
            }
          >
            <Label className={form.label}>Colour</Label>
            <Input
              className={`${controls.input} ${controls.code}`}
              placeholder="None"
            />
            <Text slot="description" className={form.help}>
              The role colour that tints its mentions, as hex. None uses the
              default mention colours.
            </Text>
          </ColorField>
        </>
      );
    case `channels`:
      return (
        <EntryText
          label="Name"
          value={text(entry, `name`)}
          onChange={(value) => update(`name`, value)}
        />
      );
    case `emoji`:
      return (
        <>
          <EntryText
            label="Name"
            value={text(entry, `name`)}
            onChange={(value) => update(`name`, value)}
          />
          <EntryText
            label="Image"
            code
            value={text(entry, `url`)}
            onChange={(value) => update(`url`, value)}
            help="An image URL, or attachment://name for a file listed under Attachments."
          />
          <EntrySwitch
            label="Animated"
            isSelected={entry.animated === true}
            onChange={(on) => update(`animated`, on ? true : undefined)}
          />
        </>
      );
    case `attachments`:
      return (
        <>
          <EntryText
            label="File on disk"
            code
            value={text(entry, `path`)}
            onChange={(value) => update(`path`, value)}
            placeholder="./images/card.png"
            help="Relative to the folder the studio command was started in, as render reads it, or absolute. Only image files can be served."
          />
          <NumberField
            className={form.field}
            value={typeof entry.size === `number` ? entry.size : Number.NaN}
            onChange={(value) =>
              update(`size`, Number.isNaN(value) ? undefined : value)
            }
            minValue={0}
            step={1}
            formatOptions={{ useGrouping: false, maximumFractionDigits: 0 }}
          >
            <Label className={form.label}>Size in bytes</Label>
            <Input
              className={`${controls.input} ${form.number}`}
              placeholder="Not shown"
            />
            <Text slot="description" className={form.help}>
              What a File component shows under the name. The file itself is not
              read for it.
            </Text>
          </NumberField>
          <AttachmentCheck name={name} path={text(entry, `path`)} />
        </>
      );
  }
};

/** One entry: its key, where it is used, its fields, and a way to remove it. */
const EntryCard = ({
  kind,
  name,
  entry
}: {
  kind: ContextKind;
  name: string;
  entry: Entry;
}): ReactElement => {
  const { report, setContext } = useEditor();
  const headingId = useId();
  const one = kindNames[kind].one;
  const title =
    kind === `attachments` ? name : text(entry, `name`) || `(no name)`;
  const update = (field: string, value: unknown): void =>
    setContext(
      (context) =>
        withEntry(context, kind, name, withField(entry, field, value)),
      // Typing in one field of one entry is one step until it pauses.
      {
        label: `Edit ${one} ${name}`,
        group: `context:${kind}:${name}:${field}`
      }
    );
  const remove = (): void =>
    setContext((context) => withEntry(context, kind, name, undefined), {
      label: `Remove ${one} ${name}`
    });
  return (
    <section
      className={form.item}
      aria-labelledby={headingId}
      data-context-entry={`${kind}:${name}`}
    >
      <div className={form.itemHead}>
        <h4 id={headingId} className={form.itemTitle}>
          {title}
          {kind === `attachments` ? null : (
            <code className={styles.key}>{name}</code>
          )}
        </h4>
        <Button
          className={form.iconButton}
          aria-label={`Remove ${one} ${name}`}
          onPress={remove}
        >
          <RemoveIcon className={form.icon} />
        </Button>
      </div>
      <Uses
        uses={usesOf(report, kind, name)}
        onRemove={remove}
        name={`${one} ${name}`}
      />
      <EntryFields kind={kind} name={name} entry={entry} update={update} />
    </section>
  );
};

/** A way to start an entry by hand: its id, or a file's name. */
const AddEntry = ({ kind }: { kind: ContextKind }): ReactElement => {
  const { setContext } = useEditor();
  const [key, setKey] = useState(``);
  const [problem, setProblem] = useState<string>();
  const one = kindNames[kind].one;
  const isFile = kind === `attachments`;
  const add = (): void => {
    const trimmed = key.trim();
    if (
      isFile
        ? trimmed === `` || /[\\/]/.test(trimmed)
        : !/^\d{1,20}$/.test(trimmed)
    ) {
      setProblem(
        isFile
          ? `A file name is what attachment://name names, such as card.png, with no folder in it.`
          : `An id is a Discord snowflake: digits only, such as 1311000000000000001.`
      );
      return;
    }
    setProblem(undefined);
    setKey(``);
    setContext(
      (context) =>
        context?.[kind]?.[trimmed] === undefined
          ? withEntry(context, kind, trimmed, newEntry({ kind }))
          : context,
      { label: `Add ${one} ${trimmed}` }
    );
  };
  return (
    <div className={styles.add}>
      <TextField
        className={form.field}
        value={key}
        onChange={setKey}
        isInvalid={problem !== undefined}
        onKeyDown={(event) => {
          if (event.key === `Enter`) add();
        }}
      >
        <Label className={form.label}>
          {isFile ? `New file's name` : `New ${one}'s id`}
        </Label>
        <Input
          className={`${controls.input} ${controls.code}`}
          autoComplete="off"
          spellCheck={false}
        />
        {problem === undefined ? null : (
          <Text slot="errorMessage" className={styles.addProblem}>
            {problem}
          </Text>
        )}
      </TextField>
      <Button className={form.quietButton} onPress={add}>
        <PlusIcon className={form.icon} />
        Add {one}
      </Button>
    </div>
  );
};

const KindSection = ({
  kind,
  group
}: {
  kind: ContextKind;
  group: Record<string, unknown>;
}): ReactElement => {
  const headingId = useId();
  const entries = Object.entries(group);
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionHeading}>
        {kindNames[kind].title}
        <span className={styles.count}>{entries.length}</span>
      </h3>
      <p className={form.help}>{kindHelp[kind]}</p>
      {entries.map(([name, value]) => (
        <EntryCard key={name} kind={kind} name={name} entry={asEntry(value)} />
      ))}
      <AddEntry kind={kind} />
    </section>
  );
};

export const SurroundingsPanel = ({
  focusEntry
}: SurroundingsPanelProps): ReactElement => {
  const editor = useEditor();
  const { report, fileKind, define, disabledReason, control } = editor;
  const unknownHeadingId = useId();
  const context: SceneContext | undefined = useWatch({
    control,
    name: `context`
  });

  // An entry just started from an unknown reference: its first field takes the cursor, so the person types its name at once.
  const handled = useRef<number>(undefined);
  useEffect(() => {
    if (focusEntry === undefined || handled.current === focusEntry.at) return;
    const input = document.querySelector<HTMLInputElement>(
      `[data-context-entry="${CSS.escape(`${focusEntry.kind}:${focusEntry.key}`)}"] input:not([type="hidden"])`
    );
    if (input === null) return;
    input.focus();
    input.select();
    input.scrollIntoView({ block: `nearest` });
    handled.current = focusEntry.at;
  }, [focusEntry, context]);

  if (fileKind !== `scene`) {
    return (
      <div className={styles.panel}>
        <p className={form.noteAttention}>
          This file holds a bare payload, which has no room for surroundings:
          who sent it, and the users, roles, channels, emoji and files its
          mentions and pictures name. Make it a scene to describe them.
        </p>
        <ConvertToScene
          fileKind={fileKind}
          fileName={editor.fileName}
          onConvert={editor.convertToScene}
          isDisabled={disabledReason !== undefined}
        />
        {report.unknown.length === 0 ? null : (
          <ul
            className={styles.unknownList}
            aria-label="Used but not described"
          >
            {report.unknown.map((reference) => (
              <UnknownNote
                key={`${reference.kind}:${reference.key}`}
                reference={reference}
                fileKind={fileKind}
                onDefine={define}
                isDisabled
              />
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {disabledReason === undefined ? null : (
        <p className={form.noteAttention}>{disabledReason}</p>
      )}
      {/* Read-only while the editor is paused, as the forms are. */}
      <fieldset
        className={styles.fields}
        disabled={disabledReason !== undefined}
      >
        <legend className={form.visuallyHidden}>
          Surroundings of the scene
        </legend>
        {report.unknown.length === 0 ? null : (
          <section
            className={styles.section}
            aria-labelledby={unknownHeadingId}
          >
            <h3 id={unknownHeadingId} className={styles.sectionHeading}>
              Used but not described
              <span className={styles.countAttention}>
                {report.unknown.length}
              </span>
            </h3>
            <ul className={styles.unknownList}>
              {report.unknown.map((reference) => (
                <UnknownNote
                  key={`${reference.kind}:${reference.key}`}
                  reference={reference}
                  fileKind={fileKind}
                  onDefine={define}
                  isDisabled={disabledReason !== undefined}
                />
              ))}
            </ul>
          </section>
        )}
        {([`users`, `roles`, `channels`, `emoji`, `attachments`] as const).map(
          (kind) => (
            <KindSection
              key={kind}
              kind={kind}
              group={asEntry(context?.[kind])}
            />
          )
        )}
      </fieldset>
    </div>
  );
};
