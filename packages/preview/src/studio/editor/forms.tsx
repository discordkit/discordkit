import { useId, type ReactElement } from "react";
import { isObject } from "@discordkit/core/utils/isObject";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { SelectDefaultValue } from "@discordkit/client/components/types/SelectDefaultValue";
import {
  maxAltText,
  maxButtonLabel,
  maxSelectOptions,
  maxSelectPlaceholder,
  maxSelectValues
} from "../../lint/limits.js";
import controls from "../controls/Fields.module.css";
import { setAccessory, setValueAt, uniqueCustomId } from "./edits.js";
import { useEditor } from "./EditorContext.js";
import {
  ChoiceControl,
  ColorControl,
  EmojiControl,
  ListChoice,
  NumberControl,
  ObjectFindings,
  SwitchControl,
  TextAreaControl,
  TextControl,
  useSceneValue
} from "./fields.js";
import { ItemList } from "./ItemList.js";
import { MessageForm } from "./MessageForm.js";
import { parsePathKey, valueAt } from "./paths.js";
import { pruneRecord } from "./prune.js";
import { buttonStyleName, type TreeNode } from "./tree.js";
import styles from "./Form.module.css";

/**
 * One form per kind of thing in the tree. Each takes the selected node's path as its field-name prefix, so every field it draws is registered at the scene path lint reports findings at.
 */

const at = (prefix: string, key: string): string => `${prefix}.${key}`;

const TextDisplayForm = ({ name }: { name: string }): ReactElement => (
  <TextAreaControl
    name={at(name, `content`)}
    label="Content"
    rows={8}
    help="Markdown, as Discord draws it in a text display: headings, -# subtext, lists, quotes, mentions and <t:…> timestamps."
  />
);

const ContainerForm = ({ name }: { name: string }): ReactElement => (
  <>
    <ColorControl
      name={at(name, `accentColor`)}
      label="Accent colour"
      help="The bar down the container's leading edge. Without one, there is no bar."
    />
    <SwitchControl
      name={at(name, `spoiler`)}
      label="Spoiler"
      help="Blurs the whole container until it is clicked."
    />
  </>
);

const SectionForm = ({ name }: { name: string }): ReactElement => {
  const { apply, disabledReason } = useEditor();
  const accessoryType = useSceneValue(at(name, `accessory.type`));
  return (
    <ListChoice
      label="Accessory"
      value={accessoryType === ComponentType.Thumbnail ? `thumbnail` : `button`}
      options={[
        { id: `thumbnail`, label: `Thumbnail` },
        { id: `button`, label: `Button` }
      ]}
      isDisabled={disabledReason !== undefined}
      help="What sits beside the section's text. Changing it replaces the accessory; edit it by selecting it in the tree."
      onChange={(choice) =>
        apply((scene) =>
          setAccessory(
            scene,
            parsePathKey(name),
            choice === `thumbnail`
              ? ComponentType.Thumbnail
              : ComponentType.Button
          )
        )
      }
    />
  );
};

const SeparatorForm = ({ name }: { name: string }): ReactElement => (
  <>
    <SwitchControl
      name={at(name, `divider`)}
      label="Draw a dividing line"
      defaultValue
      help="Off, the separator is space only."
    />
    <ChoiceControl
      name={at(name, `spacing`)}
      label="Spacing"
      defaultValue={1}
      options={[
        { id: 1, label: `Small` },
        { id: 2, label: `Large` }
      ]}
    />
  </>
);

const mediaHelp = `A URL, or attachment://name for a file uploaded with the message.`;

const ThumbnailForm = ({ name }: { name: string }): ReactElement => (
  <>
    <TextControl
      name={at(name, `media.url`)}
      label="Picture"
      code
      help={mediaHelp}
    />
    <TextAreaControl
      name={at(name, `description`)}
      label="Alt text"
      optional
      rows={2}
      help={`What the picture shows, for people who cannot see it. Up to ${String(maxAltText)} characters.`}
    />
    <SwitchControl name={at(name, `spoiler`)} label="Spoiler" />
  </>
);

const MediaGalleryForm = ({ name }: { name: string }): ReactElement => (
  <ItemList
    name={at(name, `items`)}
    label="Pictures"
    itemLabel={(index) => `Picture ${String(index + 1)}`}
    addLabel="Add picture"
    max={10}
    newItem={() => ({ media: { url: `` } })}
  >
    {(item) => (
      <>
        <TextControl
          name={at(item, `media.url`)}
          label="Picture"
          code
          help={mediaHelp}
        />
        <TextAreaControl
          name={at(item, `description`)}
          label="Alt text"
          optional
          rows={2}
        />
        <SwitchControl name={at(item, `spoiler`)} label="Spoiler" />
      </>
    )}
  </ItemList>
);

const FileForm = ({ name }: { name: string }): ReactElement => (
  <>
    <TextControl
      name={at(name, `file.url`)}
      label="File"
      code
      placeholder="attachment://notes.txt"
      help="attachment://name of a file uploaded with the message. Discord fills in its name and size on the message it returns. Until #106 lands, the client's schema asks for those too, so a finding about them shows here."
    />
    <SwitchControl name={at(name, `spoiler`)} label="Spoiler" />
  </>
);

const ActionRowForm = (): ReactElement => (
  <p className={styles.note}>
    An action row holds up to five buttons, or one select menu on its own. Add
    them from the tree.
  </p>
);

const buttonStyles = [
  ButtonStyle.Primary,
  ButtonStyle.Secondary,
  ButtonStyle.Success,
  ButtonStyle.Danger,
  ButtonStyle.Link,
  ButtonStyle.Premium
].map((style) => ({
  id: style,
  label: buttonStyleName(style),
  detail:
    style === ButtonStyle.Link
      ? `Opens a URL; sends no interaction`
      : style === ButtonStyle.Premium
        ? `Buys a SKU; Discord supplies the label`
        : `Sends an interaction with its custom id`
}));

/**
 * Discord's rule for which fields a button has follows its style: a Link button has a `url` and no `customId`, a Premium button has a `skuId` and nothing else of its own, and the other four have a `customId`. Changing the style swaps the fields to match, keeping what the new style can still use.
 */
export const restyleButton = (
  button: Record<string, unknown>,
  style: ButtonStyle,
  freshId: () => string
): Record<string, unknown> => {
  const { customId, url, skuId, label, emoji, ...rest } = button;
  if (style === ButtonStyle.Link) {
    return pruneRecord({ ...rest, style, label, emoji, url: url ?? `` });
  }
  if (style === ButtonStyle.Premium) {
    return pruneRecord({ ...rest, style, skuId: skuId ?? `` });
  }
  return pruneRecord({
    ...rest,
    style,
    label,
    emoji,
    customId: customId ?? freshId()
  });
};

const ButtonForm = ({ name }: { name: string }): ReactElement => {
  const { apply, disabledReason } = useEditor();
  const style = useSceneValue(at(name, `style`));
  const current = buttonStyles.find((option) => option.id === style)?.id;
  return (
    <>
      <ListChoice
        label="Style"
        fieldPath={at(name, `style`)}
        value={current}
        options={buttonStyles}
        isDisabled={disabledReason !== undefined}
        onChange={(next) => {
          const path = parsePathKey(name);
          // The whole button is replaced, so the keys the new style does not have leave the form as well as the file.
          apply((scene) => {
            const button = valueAt(scene, path);
            return setValueAt(
              scene,
              path,
              isObject(button)
                ? restyleButton(button, next, () =>
                    uniqueCustomId(scene, `button`)
                  )
                : button,
              path
            );
          });
        }}
      />
      {current === ButtonStyle.Premium ? (
        <TextControl
          name={at(name, `skuId`)}
          label="SKU id"
          code
          help="The product the button sells. Discord draws its name and price; the scene's context can say what they are."
        />
      ) : (
        <>
          <TextControl
            name={at(name, `label`)}
            label="Label"
            optional
            help={`Up to ${String(maxButtonLabel)} characters. A button needs a label, an emoji or both.`}
          />
          <EmojiControl name={at(name, `emoji`)} label="Emoji" />
          {current === ButtonStyle.Link ? (
            <TextControl
              name={at(name, `url`)}
              label="URL"
              code
              help="Where the button goes. Up to 512 characters."
            />
          ) : (
            <TextControl
              name={at(name, `customId`)}
              label="Custom id"
              code
              help="Sent to your app when the button is pressed. Unique in the message, up to 100 characters."
            />
          )}
        </>
      )}
      <SwitchControl name={at(name, `disabled`)} label="Disabled" />
    </>
  );
};

const channelTypes = [
  { id: 0, label: `Text` },
  { id: 2, label: `Voice` },
  { id: 4, label: `Category` },
  { id: 5, label: `Announcement` },
  { id: 13, label: `Stage` },
  { id: 15, label: `Forum` },
  { id: 16, label: `Media` }
];

const ChannelTypes = ({ name }: { name: string }): ReactElement => {
  const { apply, disabledReason } = useEditor();
  const value = useSceneValue(name);
  const chosen = Array.isArray(value) ? value.map(String) : [];
  const labelId = useId();
  return (
    <div className={styles.field} data-field-path={name}>
      <span id={labelId} className={styles.label}>
        Channel types
      </span>
      <ToggleButtonGroup
        aria-labelledby={labelId}
        className={controls.segments}
        selectionMode="multiple"
        isDisabled={disabledReason !== undefined}
        selectedKeys={chosen}
        onSelectionChange={(keys) => {
          const next = channelTypes
            .filter((type) => keys.has(String(type.id)))
            .map((type) => type.id);
          const path = parsePathKey(name);
          apply((scene) =>
            setValueAt(
              scene,
              path,
              next.length === 0 ? undefined : next,
              path.slice(0, -1)
            )
          );
        }}
      >
        {channelTypes.map((type) => (
          <ToggleButton
            key={type.id}
            id={String(type.id)}
            className={controls.segment}
          >
            {type.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <p className={styles.help}>
        None chosen lists every channel the person can see.
      </p>
      <ObjectFindings name={name} />
    </div>
  );
};

const defaultValueTypes: Partial<
  Record<ComponentType, `user` | `role` | `channel`>
> = {
  [ComponentType.UserSelect]: `user`,
  [ComponentType.RoleSelect]: `role`,
  [ComponentType.ChannelSelect]: `channel`
};

/** A new default value for a select: the kind its select takes, with an id for the person to fill in. A mentionable select starts with a user. */
const newDefaultValue = (type: ComponentType): SelectDefaultValue => {
  switch (defaultValueTypes[type]) {
    case `role`:
      return { id: ``, type: `role` };
    case `channel`:
      return { id: ``, type: `channel` };
    case `user`:
    case undefined:
      return { id: ``, type: `user` };
  }
};

const SelectForm = ({
  name,
  type
}: {
  name: string;
  type: ComponentType;
}): ReactElement => (
  <>
    <TextControl
      name={at(name, `customId`)}
      label="Custom id"
      code
      help="Sent to your app with the choice. Unique in the message, up to 100 characters."
    />
    <TextControl
      name={at(name, `placeholder`)}
      label="Placeholder"
      optional
      placeholder="Make a selection"
      help={`Shown while nothing is chosen. Up to ${String(maxSelectPlaceholder)} characters.`}
    />
    <div className={styles.row}>
      <NumberControl
        name={at(name, `minValues`)}
        label="Fewest choices"
        minValue={0}
        maxValue={maxSelectValues}
        placeholder="1"
      />
      <NumberControl
        name={at(name, `maxValues`)}
        label="Most choices"
        minValue={1}
        maxValue={maxSelectValues}
        placeholder="1"
      />
    </div>
    <SwitchControl name={at(name, `disabled`)} label="Disabled" />
    {type === ComponentType.StringSelect ? (
      <ItemList
        name={at(name, `options`)}
        label="Options"
        itemLabel={(index) => `Option ${String(index + 1)}`}
        addLabel="Add option"
        max={maxSelectOptions}
        newItem={() => ({ label: `Option`, value: `option` })}
      >
        {(option) => (
          <>
            <div className={styles.row}>
              <TextControl name={at(option, `label`)} label="Label" />
              <TextControl name={at(option, `value`)} label="Value" code />
            </div>
            <TextControl
              name={at(option, `description`)}
              label="Description"
              optional
            />
            <EmojiControl name={at(option, `emoji`)} label="Emoji" />
            <SwitchControl
              name={at(option, `default`)}
              label="Chosen by default"
            />
          </>
        )}
      </ItemList>
    ) : (
      <>
        {type === ComponentType.ChannelSelect ? (
          <ChannelTypes name={at(name, `channelTypes`)} />
        ) : null}
        <ItemList
          name={at(name, `defaultValues`)}
          label="Chosen by default"
          itemLabel={(index) => `Default ${String(index + 1)}`}
          addLabel="Add default"
          max={maxSelectValues}
          newItem={() => newDefaultValue(type)}
        >
          {(item) => (
            <>
              <TextControl
                name={at(item, `id`)}
                label={
                  type === ComponentType.MentionableSelect
                    ? `User or role id`
                    : `${defaultValueTypes[type] === `role` ? `Role` : defaultValueTypes[type] === `channel` ? `Channel` : `User`} id`
                }
                code
              />
              {type === ComponentType.MentionableSelect ? (
                <ChoiceControl
                  name={at(item, `type`)}
                  label="Kind"
                  options={[
                    { id: `user`, label: `User` },
                    { id: `role`, label: `Role` }
                  ]}
                />
              ) : null}
            </>
          )}
        </ItemList>
      </>
    )}
  </>
);

const EmbedForm = ({ name }: { name: string }): ReactElement => (
  <>
    <TextControl name={at(name, `title`)} label="Title" optional />
    <TextControl name={at(name, `url`)} label="Title link" optional code />
    <TextAreaControl
      name={at(name, `description`)}
      label="Description"
      optional
      rows={6}
      help="Markdown, as Discord draws it in an embed."
    />
    <ColorControl
      name={at(name, `color`)}
      label="Colour"
      help="The bar down the embed's leading edge."
    />
    <fieldset className={styles.group}>
      <legend className={styles.legend}>Author</legend>
      <TextControl name={at(name, `author.name`)} label="Name" optional />
      <div className={styles.row}>
        <TextControl name={at(name, `author.url`)} label="Link" optional code />
        <TextControl
          name={at(name, `author.iconUrl`)}
          label="Icon"
          optional
          code
        />
      </div>
    </fieldset>
    <ItemList
      name={at(name, `fields`)}
      label="Fields"
      itemLabel={(index) => `Field ${String(index + 1)}`}
      addLabel="Add field"
      max={25}
      newItem={() => ({ name: `Name`, value: `Value` })}
    >
      {(field) => (
        <>
          <TextControl name={at(field, `name`)} label="Name" />
          <TextAreaControl name={at(field, `value`)} label="Value" rows={2} />
          <SwitchControl
            name={at(field, `inline`)}
            label="Inline"
            help="Inline fields sit up to three to a row."
          />
        </>
      )}
    </ItemList>
    <div className={styles.row}>
      <TextControl name={at(name, `image.url`)} label="Image" optional code />
      <TextControl
        name={at(name, `thumbnail.url`)}
        label="Thumbnail"
        optional
        code
      />
    </div>
    <fieldset className={styles.group}>
      <legend className={styles.legend}>Footer</legend>
      <TextControl name={at(name, `footer.text`)} label="Text" optional />
      <TextControl
        name={at(name, `footer.iconUrl`)}
        label="Icon"
        optional
        code
      />
    </fieldset>
    <TextControl
      name={at(name, `timestamp`)}
      label="Timestamp"
      optional
      code
      placeholder="2026-11-25T16:05:00Z"
      help="Shown in the footer, in the viewer's time zone. An ISO 8601 date and time."
    />
  </>
);

const componentForm = (node: TreeNode): ReactElement => {
  const name = node.id;
  switch (node.type) {
    case ComponentType.TextDisplay:
      return <TextDisplayForm name={name} />;
    case ComponentType.Container:
      return <ContainerForm name={name} />;
    case ComponentType.Section:
      return <SectionForm name={name} />;
    case ComponentType.Separator:
      return <SeparatorForm name={name} />;
    case ComponentType.Thumbnail:
      return <ThumbnailForm name={name} />;
    case ComponentType.MediaGallery:
      return <MediaGalleryForm name={name} />;
    case ComponentType.File:
      return <FileForm name={name} />;
    case ComponentType.ActionRow:
      return <ActionRowForm />;
    case ComponentType.Button:
      return <ButtonForm name={name} />;
    case ComponentType.StringSelect:
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect:
      return <SelectForm name={name} type={node.type} />;
    // Only a modal holds these, and the renderer cannot draw them in a message; lint reports them as unsupported.
    case ComponentType.TextInput:
    case ComponentType.Label:
    case ComponentType.FileUpload:
    case ComponentType.RadioGroup:
    case ComponentType.CheckboxGroup:
    case ComponentType.Checkbox:
    case undefined:
      return (
        <p className={styles.note}>
          Studio has no form for this component: it belongs in a modal, not a
          message. Edit or remove it in the JSON pane.
        </p>
      );
  }
};

/** The form for whatever is selected in the tree: a message, an embed or a component. */
export const NodeForm = ({ node }: { node: TreeNode }): ReactElement => {
  const headingId = useId();
  return (
    <section
      className={styles.form}
      aria-labelledby={headingId}
      data-node-form={node.id}
    >
      <h3 id={headingId} className={styles.heading} tabIndex={-1}>
        {node.name}
        <span className={styles.headingDetail}>{node.summary}</span>
      </h3>
      <ObjectFindings name={node.id} />
      {/* Findings about what it holds as a whole: a row with too many buttons, a message with nothing in it. */}
      {node.kind === `message` ? (
        <>
          <ObjectFindings name={`${node.id}.payload`} />
          <ObjectFindings name={`${node.id}.payload.components`} />
          <ObjectFindings name={`${node.id}.payload.embeds`} />
        </>
      ) : (
        <ObjectFindings name={`${node.id}.components`} />
      )}
      {node.kind === `message` ? (
        <MessageForm name={node.id} />
      ) : node.kind === `embed` ? (
        <EmbedForm name={node.id} />
      ) : (
        componentForm(node)
      )}
    </section>
  );
};
