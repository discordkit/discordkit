import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  Button,
  Header,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Popover,
  Text
} from "react-aria-components";
import type { Path } from "../../findings.js";
import type { Scene } from "../../scene.js";
import {
  ChevronIcon,
  DownIcon,
  DuplicateIcon,
  PlusIcon,
  RemoveIcon,
  UpIcon
} from "../controls/icons.js";
import { ComponentTree, type Marker } from "./ComponentTree.js";
import {
  canMove,
  duplicateAt,
  insertChild,
  insertMessage,
  moveBy,
  newChild,
  removeAt,
  type EditResult
} from "./edits.js";
import { useEditor } from "./EditorContext.js";
import { NodeForm } from "./forms.js";
import { parsePathKey, pathKey } from "./paths.js";
import { startingPoints, type StartingPoint } from "./startingPoints.js";
import {
  childSlots,
  childTypeName,
  nodeFor,
  siblingSlots,
  type ChildSlot,
  type TreeNode
} from "./tree.js";
import styles from "./EditPanel.module.css";

export interface EditPanelProps {
  /** The scene as the form holds it now, cleared fields pruned. */
  scene: Scene;
  nodes: readonly TreeNode[];
  selected: TreeNode | undefined;
  onSelect: (id: string) => void;
  markers: ReadonlyMap<string, Marker>;
  collapsed: ReadonlySet<string>;
  onCollapsedChange: (collapsed: Set<string>) => void;
  /** Applies a structural edit and returns the id it selected. */
  apply: (edit: (scene: Scene) => EditResult, label: string) => string;
  /** Why nothing can be edited now, if it cannot. */
  disabledReason: string | undefined;
  /** The scene has no messages: offer the starting points instead of a tree. */
  empty: boolean;
  onStart: (point: StartingPoint) => void;
  /** A field to move focus to, from a finding the person chose. */
  focusField: { path: Path; at: number } | undefined;
  /** A node chosen somewhere the form cannot be seen from (a click in the preview): its form is scrolled into view once drawn, without moving focus. */
  reveal: { id: string; at: number } | undefined;
}

interface FocusTarget {
  /** A tree row, or a field in the form (its scene path, or the form's first field). */
  where: `tree` | `form`;
  /** The node: its row, or its form. */
  id: string;
  /** In its form, the field at this path, or at the nearest path above it that has one. Its first field when absent. */
  field?: string;
  at: number;
}

/** Whether an element is wholly in sight: inside the window and inside every box around it that scrolls. */
const isInView = (element: HTMLElement): boolean => {
  const box = element.getBoundingClientRect();
  if (box.top < 0 || box.bottom > window.innerHeight) return false;
  for (
    let parent = element.parentElement;
    parent !== null;
    parent = parent.parentElement
  ) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY !== `auto` && overflowY !== `scroll`) continue;
    const frame = parent.getBoundingClientRect();
    if (box.top < frame.top || box.bottom > frame.bottom) return false;
  }
  return true;
};

const focusable = `input:not([type="hidden"]):not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), button:not([disabled]):not([tabindex="-1"])`;

/** The structured editor: the component tree, with what can be done to the selected row above it, and the selected row's form below. On an empty scene, the starting points. */
export const EditPanel = ({
  scene,
  nodes,
  selected,
  onSelect,
  markers,
  collapsed,
  onCollapsedChange,
  apply,
  disabledReason,
  empty,
  onStart,
  focusField,
  reveal
}: EditPanelProps): ReactElement => {
  const [focus, setFocus] = useState<FocusTarget>();
  const formRef = useRef<HTMLDivElement>(null);
  const { fileKind } = useEditor();

  // A component picked in the preview is shown in the form even when the form is out of sight: below the preview in a narrow window, or scrolled away in the Edit tab.
  const revealed = useRef<number>(undefined);
  useEffect(() => {
    if (
      reveal === undefined ||
      revealed.current === reveal.at ||
      Date.now() - reveal.at > 2000
    ) {
      return;
    }
    const heading = formRef.current?.querySelector<HTMLElement>(
      `[data-node-form="${CSS.escape(reveal.id)}"] h3`
    );
    if (heading === null || heading === undefined) return;
    revealed.current = reveal.at;
    if (!isInView(heading)) heading.scrollIntoView({ block: `start` });
  }, [reveal, selected]);

  // A finding chosen in the findings panel: focus its field once its form is drawn.
  useEffect(() => {
    if (focusField === undefined) return;
    const node = nodeFor(nodes, focusField.path);
    if (node !== undefined) {
      setFocus({
        where: `form`,
        id: node.id,
        field: pathKey(focusField.path),
        at: focusField.at
      });
    }
    // Only a new request moves focus; the tree changing under it does not.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [focusField]);

  // Focus moves once the row or field it is meant for has been drawn, which after an edit is a render or two later.
  useEffect(() => {
    if (focus === undefined || focus.where !== `form`) return;
    // A request whose field never appeared is dropped, rather than stealing focus later.
    if (Date.now() - focus.at > 2000) {
      setFocus(undefined);
      return;
    }
    // Wait for the node's own form: right after an edit, the one drawn may still be its parent's.
    const nodeForm = formRef.current?.querySelector<HTMLElement>(
      `[data-node-form="${CSS.escape(focus.id)}"]`
    );
    if (nodeForm === null || nodeForm === undefined) return;
    let target: HTMLElement | null = null;
    // The field for the path, or for the nearest path above it that has one.
    for (
      let key = focus.field;
      key !== undefined && key.length > focus.id.length;
      key = key.slice(0, key.lastIndexOf(`.`))
    ) {
      const field = nodeForm.querySelector<HTMLElement>(
        `[data-field-path="${CSS.escape(key)}"]`
      );
      if (field !== null) {
        target = field.matches(focusable)
          ? field
          : field.querySelector<HTMLElement>(focusable);
        break;
      }
    }
    // Otherwise its first field, or its heading when it has none (an action row).
    target ??=
      nodeForm.querySelector<HTMLElement>(focusable) ??
      nodeForm.querySelector<HTMLElement>(`h3`);
    if (target !== null) {
      target.focus();
      setFocus(undefined);
    }
  }, [focus, selected]);

  const run = (
    edit: (current: Scene) => EditResult,
    where: FocusTarget[`where`],
    label: string
  ): void => {
    const id = apply(edit, label);
    setFocus({ where, id, at: Date.now() });
  };

  if (empty) {
    return (
      <div className={styles.panel}>
        <section className={styles.start} aria-labelledby="start-heading">
          <h3 id="start-heading" className={styles.startHeading}>
            Start from
          </h3>
          <p className={styles.startText}>
            The scene has no messages yet. Pick a starting point; it is written
            to the file, and you can change everything in it.
          </p>
          <ul className={styles.startList}>
            {startingPoints.map((point) => (
              <li key={point.id}>
                <Button
                  className={styles.startButton}
                  onPress={() => onStart(point)}
                  isDisabled={disabledReason !== undefined}
                >
                  <span className={styles.startName}>{point.name}</span>
                  <span className={styles.startDescription}>
                    {point.description}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
          {disabledReason === undefined ? null : (
            <p className={styles.notice}>{disabledReason}</p>
          )}
        </section>
      </div>
    );
  }

  const path = selected?.path;
  const disabled = disabledReason !== undefined;
  const inside = path === undefined ? [] : childSlots(scene, path);
  const beside = path === undefined ? [] : siblingSlots(scene, path);
  // A bare payload is one message, so only a scene file's messages can be added, copied, moved or removed.
  const sceneFile = fileKind === `scene`;
  const movable = path !== undefined && isMovable(path, sceneFile);
  // The message the selection is in, after which a new message goes.
  const messageIndex =
    path === undefined || path[0] !== `messages` ? undefined : Number(path[1]);
  const messageName =
    messageIndex === undefined
      ? undefined
      : nodes.find((node) => node.id === pathKey([`messages`, messageIndex]))
          ?.name;
  const messageUnavailable = sceneFile
    ? undefined
    : `This file holds one message's payload, with no room for another. Make it a scene first (Convert to a scene, in the message's form).`;
  const addMessage = (kind: `v2` | `classic`): void => {
    run(
      (current) => insertMessage(current, kind, messageIndex),
      `tree`,
      `Add a ${kind === `v2` ? `Components V2` : `classic`} message`
    );
  };
  const parentName = ((): string => {
    if (path === undefined) return ``;
    const list = path.slice(0, -1);
    const owner =
      list.at(-1) === `components` || list.at(-1) === `embeds`
        ? list.slice(0, -1)
        : list;
    const ownerPath = owner.at(-1) === `payload` ? owner.slice(0, -1) : owner;
    const node =
      nodes.length === 0 ? undefined : findNode(nodes, pathKey(ownerPath));
    return node?.name ?? `its parent`;
  })();

  const add = (slot: ChildSlot, after: boolean): void => {
    run(
      (current) =>
        insertChild(
          current,
          slot.list,
          newChild(current, slot.type),
          after && path !== undefined ? Number(path.at(-1)) + 1 : undefined
        ),
      `form`,
      `Add ${childTypeName(slot.type)}`
    );
  };
  /** An edit of the row `id`, named for the history as `verb` and the row's name: "Remove Button", "Move Message 2 up". */
  const byId = (
    id: string,
    edit: (current: Scene, at: Path) => EditResult,
    verb: (name: string) => string
  ): void =>
    run(
      (current) => edit(current, parsePathKey(id)),
      `tree`,
      verb(findNode(nodes, id)?.name ?? `component`)
    );
  const duplicateVerb = (name: string): string => `Duplicate ${name}`;
  const removeVerb = (name: string): string => `Remove ${name}`;
  const moveVerb =
    (delta: -1 | 1) =>
    (name: string): string =>
      `Move ${name} ${delta === -1 ? `up` : `down`}`;

  const menuItem = (slot: ChildSlot, after: boolean): ReactElement => (
    <MenuItem
      key={`${after ? `after` : `in`}:${String(slot.type)}`}
      id={`${after ? `after` : `in`}:${String(slot.type)}`}
      textValue={childTypeName(slot.type)}
      className={styles.menuItem}
      isDisabled={slot.unavailable !== undefined}
      onAction={() => add(slot, after)}
    >
      <Text slot="label">{childTypeName(slot.type)}</Text>
      {slot.unavailable === undefined ? null : (
        <Text slot="description" className={styles.menuDetail}>
          {slot.unavailable}
        </Text>
      )}
    </MenuItem>
  );

  return (
    <div className={styles.panel}>
      {disabledReason === undefined ? null : (
        <p className={styles.notice}>{disabledReason}</p>
      )}
      <div className={styles.treeArea}>
        <div
          className={styles.toolbar}
          role="toolbar"
          aria-label={`Edit ${selected?.name ?? `the selection`}`}
        >
          <MenuTrigger>
            <Button
              className={styles.addButton}
              isDisabled={disabled || selected === undefined}
            >
              <PlusIcon className={styles.icon} />
              Add
              <ChevronIcon className={styles.icon} />
            </Button>
            <Popover className={styles.menuPopover} placement="bottom start">
              <Menu className={styles.menu} aria-label="Add">
                {inside.length === 0 ? null : (
                  <MenuSection className={styles.menuSection}>
                    <Header className={styles.menuHeader}>
                      Inside {selected?.name}
                    </Header>
                    {inside.map((slot) => menuItem(slot, false))}
                  </MenuSection>
                )}
                {beside.length === 0 ? null : (
                  <MenuSection className={styles.menuSection}>
                    <Header className={styles.menuHeader}>
                      After it, in {parentName}
                    </Header>
                    {beside.map((slot) => menuItem(slot, true))}
                  </MenuSection>
                )}
                <MenuSection className={styles.menuSection}>
                  <Header className={styles.menuHeader}>
                    A new message, after {messageName ?? `the last`}
                  </Header>
                  {messageKinds.map((kind) => (
                    <MenuItem
                      key={kind.id}
                      id={`message:${kind.id}`}
                      textValue={kind.label}
                      className={styles.menuItem}
                      isDisabled={messageUnavailable !== undefined}
                      onAction={() => addMessage(kind.id)}
                    >
                      <Text slot="label">{kind.label}</Text>
                      <Text slot="description" className={styles.menuDetail}>
                        {messageUnavailable ?? kind.detail}
                      </Text>
                    </MenuItem>
                  ))}
                </MenuSection>
              </Menu>
            </Popover>
          </MenuTrigger>
          <span className={styles.toolbarGap} />
          <Button
            className={styles.iconButton}
            aria-label="Duplicate"
            aria-keyshortcuts="Control+D"
            isDisabled={disabled || !movable}
            onPress={() =>
              path !== undefined &&
              byId(pathKey(path), duplicateAt, duplicateVerb)
            }
          >
            <DuplicateIcon className={styles.icon} />
          </Button>
          <Button
            className={styles.iconButton}
            aria-label="Move up"
            aria-keyshortcuts="Alt+ArrowUp"
            isDisabled={disabled || !movable || !canMove(scene, path, -1)}
            onPress={() =>
              path !== undefined &&
              byId(
                pathKey(path),
                (current, at) => moveBy(current, at, -1),
                moveVerb(-1)
              )
            }
          >
            <UpIcon className={styles.icon} />
          </Button>
          <Button
            className={styles.iconButton}
            aria-label="Move down"
            aria-keyshortcuts="Alt+ArrowDown"
            isDisabled={disabled || !movable || !canMove(scene, path, 1)}
            onPress={() =>
              path !== undefined &&
              byId(
                pathKey(path),
                (current, at) => moveBy(current, at, 1),
                moveVerb(1)
              )
            }
          >
            <DownIcon className={styles.icon} />
          </Button>
          <Button
            className={styles.iconButton}
            aria-label="Remove"
            aria-keyshortcuts="Delete"
            isDisabled={disabled || !movable}
            onPress={() =>
              path !== undefined && byId(pathKey(path), removeAt, removeVerb)
            }
          >
            <RemoveIcon className={styles.icon} />
          </Button>
        </div>
        <div className={styles.treeScroll}>
          <ComponentTree
            nodes={nodes}
            selected={selected?.id}
            onSelect={onSelect}
            markers={markers}
            collapsed={collapsed}
            onCollapsedChange={onCollapsedChange}
            focusRequest={focus?.where === `tree` ? focus : undefined}
            isDisabled={disabled}
            isMovable={(at) => isMovable(at, sceneFile)}
            onMove={(id, delta) => {
              const at = parsePathKey(id);
              if (canMove(scene, at, delta))
                byId(
                  id,
                  (current) => moveBy(current, at, delta),
                  moveVerb(delta)
                );
            }}
            onRemove={(id) => byId(id, removeAt, removeVerb)}
            onDuplicate={(id) => byId(id, duplicateAt, duplicateVerb)}
          />
        </div>
        <p className={styles.hint}>
          Alt+↑/↓ moves · Delete removes · Ctrl+D duplicates
        </p>
      </div>
      <div ref={formRef} className={styles.formArea}>
        {selected === undefined ? (
          <p className={styles.hint}>
            Select a component in the tree or the preview.
          </p>
        ) : (
          <NodeForm key={selected.id} node={selected} />
        )}
      </div>
    </div>
  );
};

const messageKinds = [
  {
    id: `v2` as const,
    label: `Components V2 message`,
    detail: `Containers, text and media`
  },
  {
    id: `classic` as const,
    label: `Classic message`,
    detail: `Text, embeds and rows of buttons`
  }
];

/** Whether the node at `path` sits in a list it can be copied, moved and removed in: any component or embed, and a message in a scene file, whose messages are a list of their own. */
const isMovable = (path: Path, sceneFile: boolean): boolean =>
  typeof path.at(-1) === `number` &&
  (path.length > 2 || (sceneFile && path.length === 2));

const findNode = (
  nodes: readonly TreeNode[],
  id: string
): TreeNode | undefined => {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found !== undefined) return found;
  }
  return undefined;
};
