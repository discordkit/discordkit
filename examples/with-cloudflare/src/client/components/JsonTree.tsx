import { useMemo, useRef, useState } from "react";
import {
  Button,
  Collection,
  Menu,
  MenuItem,
  Popover,
  Tree,
  TreeItem,
  TreeItemContent
} from "react-aria-components";
import type { Key, Selection } from "react-aria-components";
import { ChevronRight } from "lucide-react";
import {
  DISCORD_EPOCH,
  snowflakeToDate
} from "@discordkit/core/validations/snowflake";

/**
 * A collapsible JSON viewer modelled on Chrome DevTools' "Preview" tab, built
 * on React Aria's `Tree` so expansion, roving focus, typeahead, and the ARIA
 * treegrid semantics come from the library rather than being re-implemented
 * here (arrow keys navigate, left/right collapse/expand, as in DevTools).
 *
 * Gateway payloads are big and deeply nested — a `GUILD_CREATE` for a modest
 * server runs to thousands of lines — so a flat `JSON.stringify` is close to
 * unreadable. Values WRAP rather than scrolling horizontally: a long message
 * content or a base64 avatar hash would otherwise push the panel into a
 * horizontal scroll and drag the layout wide with it.
 */

type Json = unknown;

const isObj = (value: Json): value is Record<string, Json> =>
  typeof value === `object` && value !== null && !Array.isArray(value);

/** A flattened node the Tree collection can consume. */
interface Node {
  /** Unique across the whole tree — Tree keys must not collide by depth. */
  id: string;
  name: string;
  value: Json;
  /** Dotted/bracketed path, used for "Copy property path". */
  path: string;
  /** Nesting level, since RAC's Tree leaves visual indentation to the row. */
  depth: number;
  children: Node[];
}

const childrenOf = (value: Json, path: string, depth: number): Node[] => {
  const entries: Array<[string, Json]> = Array.isArray(value)
    ? value.map((item, index) => [String(index), item])
    : isObj(value)
      ? Object.entries(value)
      : [];

  return entries.map(([key, nested]) => {
    const childPath = Array.isArray(value)
      ? `${path}[${key}]`
      : `${path}.${key}`;
    return {
      id: childPath,
      name: key,
      value: nested,
      path: childPath,
      depth,
      children: childrenOf(nested, childPath, depth + 1)
    };
  });
};

/** Chrome-style one-line summary of a collapsed branch. */
const preview = (value: Json): string => {
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (isObj(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) return `{}`;
    const shown = keys.slice(0, 3).join(`, `);
    return `{${shown}${keys.length > 3 ? `, …` : ``}}`;
  }
  return ``;
};

/**
 * Recognise values by what they MEAN to Discord, not just by JSON type.
 *
 * Generic JSON colouring tells you `"1157272423910084608"` is a string, which
 * you could see. Recognising it as a snowflake — and showing when it was
 * created — answers the question you actually had. These are the fields you
 * chase through a Gateway payload, so they are the ones worth annotating.
 */
const isSnowflake = (value: string): boolean => {
  // Cheap structural check first: snowflakes are 17-20 digits. Without this
  // every short numeric string would go through BigInt parsing.
  if (!/^\d{17,20}$/.test(value)) return false;
  try {
    return snowflakeToDate(value).getTime() >= Number(DISCORD_EPOCH);
  } catch {
    return false;
  }
};

/** ISO-8601, the shape Discord uses for `timestamp`/`joined_at` and friends. */
const ISO_DATE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

/** Relative age, so a timestamp reads as "when" rather than as digits. */
const ago = (at: Date): string => {
  const seconds = Math.round((Date.now() - at.getTime()) / 1000);
  if (!Number.isFinite(seconds)) return ``;
  const future = seconds < 0;
  const abs = Math.abs(seconds);
  const [value, unit] =
    abs < 60
      ? [abs, `s`]
      : abs < 3600
        ? [Math.round(abs / 60), `m`]
        : abs < 86400
          ? [Math.round(abs / 3600), `h`]
          : [Math.round(abs / 86400), `d`];
  return future ? `in ${value}${unit}` : `${value}${unit} ago`;
};

/** An annotation shown after a value, e.g. a snowflake's creation time. */
const Note = ({
  children
}: {
  children: React.ReactNode;
}): React.JSX.Element => (
  <span className="ml-1.5 text-ink-muted">{children}</span>
);

const Leaf = ({ value }: { value: Json }): React.JSX.Element => {
  if (typeof value === `string`) {
    if (isSnowflake(value)) {
      // A snowflake embeds its creation time in the high bits, so the id
      // itself says when the thing was made — no lookup needed.
      const created = snowflakeToDate(value);
      return (
        <span className="break-all text-ok">
          &quot;{value}&quot;
          <Note>id · {ago(created)}</Note>
        </span>
      );
    }
    if (ISO_DATE.test(value)) {
      return (
        <span className="break-all text-accent">
          &quot;{value}&quot;
          <Note>{ago(new Date(value))}</Note>
        </span>
      );
    }
    if (/^https?:\/\//.test(value)) {
      // Opens in a new tab: following a link out of the inspector would drop
      // the session you are inspecting.
      return (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="break-all text-accent underline decoration-ink-line-strong underline-offset-2 hover:decoration-current"
        >
          &quot;{value}&quot;
        </a>
      );
    }
    if (value === ``) {
      // An empty string is usually the MESSAGE_CONTENT intent silently not
      // being granted, which is invisible if it renders as `""`.
      return (
        <span className="text-ink-muted italic">&quot;&quot; (empty)</span>
      );
    }
    return <span className="break-all text-warn">&quot;{value}&quot;</span>;
  }
  if (typeof value === `number`) {
    // Unix seconds/ms in a plausible range read as a time rather than a
    // magnitude — TYPING_START's `timestamp` (seconds) and our own lifecycle
    // `at` (milliseconds) are both common.
    //
    // Milliseconds MUST be tested first: a ms value also satisfies the
    // seconds bound, so checking seconds first multiplied it again and
    // produced "178694264910447m ago".
    const asMs =
      value > 1_000_000_000_000 && value < 4_000_000_000_000
        ? value
        : value > 1_000_000_000 && value < 4_000_000_000
          ? value * 1000
          : null;
    return (
      <span className="text-accent">
        {String(value)}
        {asMs === null ? null : <Note>{ago(new Date(asMs))}</Note>}
      </span>
    );
  }
  if (typeof value === `boolean`) {
    return <span className="text-accent">{String(value)}</span>;
  }
  if (value === null) return <span className="text-ink-muted">null</span>;
  if (Array.isArray(value)) return <span className="text-ink-muted">[]</span>;
  return <span className="text-ink-muted">{`{}`}</span>;
};

/**
 * `navigator.clipboard` is undefined on insecure origins, and this example is
 * served over plain http in local dev — so the call is guarded rather than
 * assumed. A failure here is not worth interrupting the user for; the menu
 * simply closes.
 */
const copy = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard unavailable (insecure origin, or permission denied).
  }
};

const menuItemClass = `cursor-default px-3 py-1.5 text-ink-body outline-none focus:bg-indigo-500/20 focus:text-ink-text`;

const Row = ({ node }: { node: Node }): React.JSX.Element => {
  const branch = node.children.length > 0;
  // Where the context menu should appear, or `null` when closed.
  //
  // `MenuTrigger trigger="contextMenu"` typechecks in react-aria-components
  // 1.20 but only adjusts the popover offset — the right-click wiring itself
  // isn't implemented in this version, so the menu never opened. Driving the
  // open state from `onContextMenu` and anchoring a `Popover` to the pointer
  // gets DevTools behaviour while keeping RAC's Menu for focus and ARIA.
  const [menuAt, setMenuAt] = useState<{ x: number; y: number } | null>(null);
  // A real (empty) element the popover can anchor to and observe. RAC runs a
  // ResizeObserver on the trigger, which rejects a plain object standing in
  // for an Element, so the anchor has to exist in the DOM.
  const anchorRef = useRef<HTMLSpanElement>(null);

  return (
    <TreeItem id={node.id} textValue={node.name} className="outline-none">
      <TreeItemContent>
        <>
          <div
            className="flex min-w-0 items-start gap-1 rounded px-1 py-px hover:bg-ink-line/40 group-focus-visible:bg-ink-line/60"
            // RAC's Tree tracks depth for ARIA but does not indent visually,
            // so nested fields would otherwise sit flush with their parent's
            // siblings and the structure would be unreadable.
            style={{ paddingLeft: `${node.depth * 0.875 + 0.25}rem` }}
            onContextMenu={(event) => {
              event.preventDefault();
              // Stop ancestors opening their own menu for the same click —
              // nested nodes would otherwise all fire.
              event.stopPropagation();
              setMenuAt({ x: event.clientX, y: event.clientY });
            }}
          >
            <Button
              slot="chevron"
              className={`mt-0.75 shrink-0 rounded outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 ${
                branch ? `text-ink-muted` : `invisible`
              }`}
            >
              <ChevronRight
                size={12}
                aria-hidden
                className="transition-transform group-expanded:rotate-90"
              />
            </Button>

            <span className="min-w-0 break-all">
              <span className="text-ink-body">{node.name}</span>
              <span className="text-ink-muted">: </span>
              {branch ? (
                <>
                  <span className="text-ink-muted group-expanded:hidden">
                    {preview(node.value)}
                  </span>
                  <span className="hidden text-ink-muted group-expanded:inline">
                    {Array.isArray(node.value) ? `[` : `{`}
                  </span>
                </>
              ) : (
                <Leaf value={node.value} />
              )}
            </span>
          </div>

          {/* A zero-size anchor pinned at the cursor, so the popover opens
              where you right-clicked rather than at the row's edge. */}
          <span
            ref={anchorRef}
            aria-hidden
            className="pointer-events-none fixed"
            style={{ left: menuAt?.x ?? 0, top: menuAt?.y ?? 0 }}
          />
          <Popover
            triggerRef={anchorRef}
            isOpen={menuAt !== null}
            onOpenChange={(open) => {
              if (!open) setMenuAt(null);
            }}
            placement="bottom start"
            className="rounded border border-ink-line-strong bg-ink-panel py-1 shadow-lg"
          >
            <Menu
              className="min-w-44 text-xs outline-none"
              onAction={(key) => {
                const text =
                  key === `path`
                    ? node.path
                    : key === `json`
                      ? JSON.stringify(node.value)
                      : typeof node.value === `string`
                        ? node.value
                        : JSON.stringify(node.value, null, 2);
                void copy(text);
              }}
            >
              <MenuItem id="value" className={menuItemClass}>
                Copy value
              </MenuItem>
              <MenuItem id="path" className={menuItemClass}>
                Copy property path
              </MenuItem>
              <MenuItem id="json" className={menuItemClass}>
                Copy as JSON
              </MenuItem>
            </Menu>
          </Popover>
        </>
      </TreeItemContent>

      {branch ? (
        <Collection items={node.children}>{renderNode}</Collection>
      ) : null}
    </TreeItem>
  );
};

const renderNode = (node: Node): React.JSX.Element => (
  <Row key={node.id} node={node} />
);

export const JsonTree = ({ data }: { data: Json }): React.JSX.Element => {
  const nodes = useMemo(() => childrenOf(data, `$`, 0), [data]);

  // Top-level scalar/object fields start open so the payload's shape is
  // visible; arrays stay folded whatever their depth, since `GUILD_CREATE`
  // carries `roles`, `channels`, and `members` arrays whose length is
  // unbounded — auto-expanding one pushes every sibling off-screen.
  const defaultExpanded = useMemo(
    () =>
      new Set<Key>(
        nodes
          .filter(
            (node) => node.children.length > 0 && !Array.isArray(node.value)
          )
          .map((node) => node.id)
      ),
    [nodes]
  );

  // `null` means "untouched — use this payload's defaults". Selecting a
  // different event produces a new `defaultExpanded` identity, and the stored
  // `for` no longer matches, so expansion resets without an effect or a
  // setState during render.
  const [expansion, setExpansion] = useState<{
    for: Set<Key>;
    keys: Selection;
  } | null>(null);

  const expanded =
    expansion?.for === defaultExpanded ? expansion.keys : defaultExpanded;
  const setExpanded = (keys: Selection): void => {
    setExpansion({ for: defaultExpanded, keys });
  };

  if (nodes.length === 0) {
    return <p className="p-4 text-xs text-ink-muted">Empty payload.</p>;
  }

  return (
    <Tree
      aria-label="Event payload"
      items={nodes}
      expandedKeys={expanded}
      onExpandedChange={setExpanded}
      selectionMode="none"
      className="min-w-0 p-2 font-mono text-xs leading-relaxed outline-none"
    >
      {renderNode}
    </Tree>
  );
};
