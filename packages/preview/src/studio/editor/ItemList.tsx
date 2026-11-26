import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode
} from "react";
import { Button } from "react-aria-components";
import type { Path } from "../../findings.js";
import type { Scene } from "../../scene.js";
import { DownIcon, PlusIcon, RemoveIcon, UpIcon } from "../controls/icons.js";
import { insertChild, moveTo, removeAt, type EditResult } from "./edits.js";
import { useEditor } from "./EditorContext.js";
import { ObjectFindings, useSceneValue } from "./fields.js";
import { parsePathKey } from "./paths.js";
import styles from "./Form.module.css";

let nextKey = 0;
const newKey = (): string => `item-${String(nextKey++)}`;

/**
 * A list inside one component that the person edits in its form rather than in the tree: a select's options, its default values, a gallery's pictures, an embed's fields.
 *
 * Each item keeps its key when the list is reordered or shortened here, so the field a person was typing in moves with its item rather than the next item's text appearing under their caret. The keys follow the edits made here; when the list changes length from elsewhere (the JSON pane, an agent), they are made afresh, as a field array's are on a reset. Every item can move up or down and be removed with the keyboard, and the edits go through the same `apply` as the tree's, so they reach the file the same way.
 */
export const ItemList = ({
  name,
  label,
  itemLabel,
  addLabel,
  newItem,
  max,
  children
}: {
  /** The list's scene path. */
  name: string;
  /** The list's name, for its heading: "Options". */
  label: string;
  /** One item's name, for its heading and its buttons' accessible names: "Option 2". */
  itemLabel: (index: number) => string;
  addLabel: string;
  newItem: () => unknown;
  /** Discord's limit on the list's length, past which the add button is off. */
  max?: number;
  /** The item's fields, given its path. */
  children: (path: string, index: number) => ReactNode;
}): ReactElement => {
  const editor = useEditor();
  const value = useSceneValue(name);
  const count = Array.isArray(value) ? value.length : 0;
  const [keys, setKeys] = useState<string[]>(() =>
    Array.from({ length: count }, newKey)
  );
  // Adjusted while rendering when the list changed length from elsewhere, as React recommends over an effect.
  if (keys.length !== count) setKeys(Array.from({ length: count }, newKey));

  const list: Path = parsePathKey(name);
  // The component the list belongs to stays selected through every edit to it.
  const owner = list.slice(0, -1);
  const change = (
    edit: (scene: Scene) => EditResult,
    nextKeys: string[]
  ): void => {
    setKeys(nextKeys);
    editor.apply((scene) => ({ ...edit(scene), selected: owner }));
  };

  // A new item's first field takes focus, so the person types straight into it.
  const listRef = useRef<HTMLDivElement>(null);
  const [focusKey, setFocusKey] = useState<string>();
  useEffect(() => {
    if (focusKey === undefined) return;
    const field = listRef.current?.querySelector<HTMLElement>(
      `[data-item-key="${focusKey}"] input:not([type="hidden"]), [data-item-key="${focusKey}"] textarea`
    );
    if (field === null || field === undefined) return;
    field.focus();
    setFocusKey(undefined);
  }, [focusKey, keys]);

  const disabled = editor.disabledReason !== undefined;
  const full = max !== undefined && count >= max;
  return (
    <fieldset className={styles.group} data-field-path={name}>
      <legend className={styles.legend}>
        {label} ({count}
        {max === undefined ? `` : ` of ${String(max)}`})
      </legend>
      <ObjectFindings name={name} />
      <div ref={listRef} className={styles.list}>
        {keys.map((key, index) => {
          const title = itemLabel(index);
          const moved = (to: number): string[] => {
            const next = [...keys];
            const [item] = next.splice(index, 1);
            next.splice(to, 0, item);
            return next;
          };
          return (
            <section
              key={key}
              data-item-key={key}
              className={styles.item}
              aria-label={title}
            >
              <div className={styles.itemHead}>
                <span className={styles.itemTitle}>{title}</span>
                <Button
                  className={styles.iconButton}
                  aria-label={`Move ${title} up`}
                  isDisabled={disabled || index === 0}
                  onPress={() =>
                    change(
                      (scene) => moveTo(scene, [...list, index], index - 1),
                      moved(index - 1)
                    )
                  }
                >
                  <UpIcon className={styles.icon} />
                </Button>
                <Button
                  className={styles.iconButton}
                  aria-label={`Move ${title} down`}
                  isDisabled={disabled || index === keys.length - 1}
                  onPress={() =>
                    change(
                      (scene) => moveTo(scene, [...list, index], index + 1),
                      moved(index + 1)
                    )
                  }
                >
                  <DownIcon className={styles.icon} />
                </Button>
                <Button
                  className={styles.iconButton}
                  aria-label={`Remove ${title}`}
                  isDisabled={disabled}
                  onPress={() =>
                    change(
                      (scene) => removeAt(scene, [...list, index]),
                      keys.filter((candidate) => candidate !== key)
                    )
                  }
                >
                  <RemoveIcon className={styles.icon} />
                </Button>
              </div>
              <ObjectFindings name={`${name}.${String(index)}`} />
              {children(`${name}.${String(index)}`, index)}
            </section>
          );
        })}
      </div>
      <div>
        <Button
          className={styles.quietButton}
          isDisabled={disabled || full}
          onPress={() => {
            const key = newKey();
            change(
              (scene) => insertChild(scene, list, newItem()),
              [...keys, key]
            );
            setFocusKey(key);
          }}
        >
          <PlusIcon className={styles.icon} />
          {addLabel}
        </Button>
      </div>
    </fieldset>
  );
};
