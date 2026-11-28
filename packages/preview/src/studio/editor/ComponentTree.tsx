import {
  memo,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
  type ReactElement
} from "react";
import {
  Button,
  Collection,
  Tree,
  TreeItem,
  TreeItemContent,
  type Key,
  type Selection
} from "react-aria-components";
import { ChevronRightIcon, ErrorIcon, WarningIcon } from "../controls/icons.js";
import { flatten, type TreeNode } from "./tree.js";
import styles from "./ComponentTree.module.css";

/** How many findings sit at or under a node, for its marker. */
export interface Marker {
  errors: number;
  warnings: number;
}

export interface ComponentTreeProps {
  nodes: readonly TreeNode[];
  selected: string | undefined;
  onSelect: (id: string) => void;
  markers: ReadonlyMap<string, Marker>;
  collapsed: ReadonlySet<string>;
  onCollapsedChange: (collapsed: Set<string>) => void;
  /** A row to move keyboard focus to after an edit, with a counter so the same row can be asked for twice. */
  focusRequest: { id: string; at: number } | undefined;
  /** Keyboard shortcuts on the focused row. */
  onMove: (id: string, delta: -1 | 1) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  isDisabled: boolean;
  /** Whether a row can be copied, moved and removed: a message only in a scene file. */
  isMovable: (path: TreeNode[`path`]) => boolean;
}

const markerText = ({ errors, warnings }: Marker): string =>
  [
    errors > 0 ? `${String(errors)} error${errors === 1 ? `` : `s`}` : ``,
    warnings > 0
      ? `${String(warnings)} warning${warnings === 1 ? `` : `s`}`
      : ``
  ]
    .filter(Boolean)
    .join(`, `);

/**
 * The message as a tree: every component nested as the payload nests it, the selected one highlighted, a marker on any node with findings at or under it. It is react-aria's `Tree`, so arrow keys move and fold, typing jumps to a row by name, and screen readers hear a tree.
 *
 * Rows can be moved with Alt+Up and Alt+Down, removed with Delete and duplicated with Ctrl+D (⌘D). Moving a row into another parent is not offered: Discord's rules differ by parent, and the add menu is the way to put something new there. Dragging rows is left out: react-aria's drag and drop added 139 kB (29 kB gzipped) to the app for what the keys and the toolbar already do.
 */
export const ComponentTree = memo(function ComponentTree({
  nodes,
  selected,
  onSelect,
  markers,
  collapsed,
  onCollapsedChange,
  focusRequest,
  onMove,
  onRemove,
  onDuplicate,
  isDisabled,
  isMovable
}: ComponentTreeProps): ReactElement {
  const all = useMemo(() => flatten(nodes), [nodes]);
  const byId = useMemo(
    () => new Map(all.map((node) => [node.id, node])),
    [all]
  );
  const branches = useMemo(
    () => all.filter((node) => node.children.length > 0).map((node) => node.id),
    [all]
  );
  const expanded = useMemo(
    () => new Set<Key>(branches.filter((id) => !collapsed.has(id))),
    [branches, collapsed]
  );

  const ref = useRef<HTMLDivElement>(null);
  // The row an edit moved or made can appear a render after the edit, so each request is tried until its row is drawn, once, and dropped after two seconds.
  const handled = useRef<number>(undefined);
  useEffect(() => {
    if (
      focusRequest === undefined ||
      handled.current === focusRequest.at ||
      Date.now() - focusRequest.at > 2000
    ) {
      return;
    }
    const row = ref.current?.querySelector<HTMLElement>(
      `[data-key="${CSS.escape(focusRequest.id)}"]`
    );
    if (row === null || row === undefined) return;
    row.focus();
    handled.current = focusRequest.at;
  }, [focusRequest, nodes]);

  const movable = (node: TreeNode | undefined): node is TreeNode =>
    node !== undefined && isMovable(node.path);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (isDisabled) return;
    const row = (
      event.target instanceof Element ? event.target : null
    )?.closest<HTMLElement>(`[data-key]`);
    const id = row?.dataset.key;
    const node = id === undefined ? undefined : byId.get(id);
    if (!movable(node)) return;
    if (
      event.altKey &&
      (event.key === `ArrowUp` || event.key === `ArrowDown`)
    ) {
      event.preventDefault();
      event.stopPropagation();
      onMove(node.id, event.key === `ArrowUp` ? -1 : 1);
    } else if (
      event.key === `Delete` ||
      (event.key === `Backspace` && (event.metaKey || event.ctrlKey))
    ) {
      event.preventDefault();
      event.stopPropagation();
      onRemove(node.id);
    } else if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === `d`
    ) {
      event.preventDefault();
      event.stopPropagation();
      onDuplicate(node.id);
    }
  };

  const renderNode = (node: TreeNode): ReactElement => {
    const marker = markers.get(node.id);
    const markerLabel = marker === undefined ? `` : markerText(marker);
    return (
      <TreeItem
        id={node.id}
        textValue={`${node.name} ${node.summary}${markerLabel === `` ? `` : `, ${markerLabel}`}`}
        className={styles.row}
      >
        <TreeItemContent>
          {({ hasChildItems }) => (
            <div className={styles.rowInner}>
              {hasChildItems ? (
                <Button
                  slot="chevron"
                  className={styles.chevron}
                  aria-label={`Fold ${node.name}`}
                >
                  <ChevronRightIcon className={styles.chevronIcon} />
                </Button>
              ) : (
                <span className={styles.chevronSpacer} />
              )}
              <span className={styles.name}>{node.name}</span>
              <span className={styles.summary}>{node.summary}</span>
              {marker === undefined ? null : (
                <span
                  className={
                    marker.errors > 0
                      ? styles.markerError
                      : styles.markerWarning
                  }
                  title={markerLabel}
                >
                  {marker.errors > 0 ? (
                    <ErrorIcon className={styles.markerIcon} />
                  ) : (
                    <WarningIcon className={styles.markerIcon} />
                  )}
                  <span className={styles.visuallyHidden}>{markerLabel}</span>
                </span>
              )}
            </div>
          )}
        </TreeItemContent>
        <Collection items={node.children}>{renderNode}</Collection>
      </TreeItem>
    );
  };

  return (
    <div ref={ref} className={styles.frame} onKeyDownCapture={onKeyDown}>
      <Tree
        aria-label="Components"
        aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Delete Control+D"
        className={styles.tree}
        items={nodes}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={selected === undefined ? [] : [selected]}
        onSelectionChange={(keys: Selection) => {
          if (keys === `all`) return;
          const key = keys.values().next().value;
          if (key !== undefined) onSelect(String(key));
        }}
        expandedKeys={expanded}
        onExpandedChange={(keys) =>
          onCollapsedChange(new Set(branches.filter((id) => !keys.has(id))))
        }
        // Rows are drawn once per item object; the markers come from lint, which runs after the tree is built.
        dependencies={[markers]}
      >
        {renderNode}
      </Tree>
    </div>
  );
});
