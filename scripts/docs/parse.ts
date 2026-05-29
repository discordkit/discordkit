/**
 * T2: Discord docs markdown parser.
 *
 * Reads a cached `.discord-docs/<page>.md` file and emits a structured
 * `DocResource`. Pure: no opinions about TypeScript/valibot output.
 *
 * Built on unified + remark-parse + remark-gfm + remark-mdx so MDX
 * constructs like `<Route method="GET">/users/@me</Route>`,
 * `<ManualAnchor id="..." />`, and `<Note>...</Note>` parse as proper
 * AST nodes rather than raw text.
 *
 * Approach: bottom-up scan. We walk the AST linearly tracking the current
 * heading stack at each node, then classify Routes (endpoints), Tables
 * (objects/enums/params), and admonitions by what heading they live under.
 * This avoids fragile assumptions about depth nesting — Discord's docs are
 * not consistent about whether a Structure table lives under ###### or ###
 * or directly under the parent ##.
 *
 * Usage as a library:
 *   import { parseResource } from "./parse.ts";
 *   const resource = parseResource(markdown);
 *
 * Usage as a CLI:
 *   node --experimental-strip-types scripts/docs/parse.ts <relative-path-under-.discord-docs>
 *   node --experimental-strip-types scripts/docs/parse.ts --json resources/user.md > out.json
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import { toString as mdToString } from "mdast-util-to-string";
import type { Root, RootContent, Table, PhrasingContent } from "mdast";

// MDX AST node interfaces.
interface MdxJsxElement {
  type: `mdxJsxFlowElement` | `mdxJsxTextElement`;
  name: string | null;
  attributes: MdxJsxAttribute[];
  children: RootContent[];
}
interface MdxJsxAttribute {
  type: `mdxJsxAttribute`;
  name: string;
  value:
    | string
    | { type: `mdxJsxAttributeValueExpression`; value: string }
    | null;
}

// ─── public types ─────────────────────────────────────────────────────────

export type HttpMethod = `GET` | `POST` | `PUT` | `PATCH` | `DELETE`;

export interface DocResource {
  title: string;
  description: string;
  objects: DocObject[];
  enums: DocEnum[];
  endpoints: DocEndpoint[];
  /** `## ...` sections that yielded neither an endpoint nor an object/enum. */
  unparsedSections: string[];
}

export interface DocObject {
  name: string;
  anchor: string | null;
  structureAnchor: string | null;
  description: string;
  fields: DocField[];
}

export interface DocEnum {
  name: string;
  anchor: string | null;
  rows: DocEnumRow[];
}

export interface DocEnumRow {
  value: string;
  name: string;
  description: string | null;
}

export interface DocEndpoint {
  name: string;
  slug: string;
  method: HttpMethod;
  path: string;
  rawPath: string;
  description: string;
  notes: AdmonitionBlock[];
  jsonParams: DocFieldGroup[];
  queryParams: DocFieldGroup[];
  formParams: DocFieldGroup[];
  /**
   * Code-block examples that appear *under* the endpoint heading,
   * typically nested below an H6 sub-heading like `Example Partial Guild`
   * or `Example Response`. Captured in document order.
   */
  examples: DocExample[];
}

export interface DocExample {
  /** The closest sub-heading the example sits under (e.g. `Example Partial Guild`), or `null` if none. */
  headingText: string | null;
  /** The fenced language tag — `json`, `python`, `text`, etc. May be empty. */
  lang: string;
  /** The code-block contents, with trailing whitespace stripped. */
  value: string;
}

export interface AdmonitionBlock {
  kind: `Note` | `Warning` | `Warn` | `Info` | `Tip` | `Danger`;
  content: string;
}

export interface DocFieldGroup {
  variant: string;
  fields: DocField[];
}

export interface DocField {
  rawName: string;
  name: string;
  optional: boolean;
  type: DocFieldType;
  description: string;
  required: boolean | null;
  default: string | null;
}

export type DocFieldType =
  | { kind: `primitive`; name: string; nullable: boolean }
  | {
      kind: `ref`;
      refName: string;
      refUrl: string;
      nullable: boolean;
      objectSuffix: boolean;
    }
  | { kind: `array`; element: DocFieldType; nullable: boolean }
  | { kind: `raw`; raw: string; nullable: boolean };

// ─── constants ─────────────────────────────────────────────────────────────

const PRIMITIVE_TYPES = new Set([
  `snowflake`,
  `string`,
  `integer`,
  `number`,
  `float`,
  `boolean`,
  `bool`,
  `object`,
  `dict`,
  `any`,
  `null`,
  `iso8601 timestamp`,
  `binary`,
  `file contents`,
  `mixed`
]);

const ADMONITION_NAMES = new Set<AdmonitionBlock[`kind`]>([
  `Note`,
  `Warning`,
  `Warn`,
  `Info`,
  `Tip`,
  `Danger`
]);

// ─── public entry point ────────────────────────────────────────────────────

export function parseResource(markdown: string): DocResource {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMdx)
    .parse(markdown) as Root;

  // Title and resource description.
  const { title, description, bodyStart } = extractHeader(tree.children);

  // Pre-pass: build an indexed view of every node, with the heading-stack
  // at each position. Each node has [h2, h3, h4, h5, h6] showing the nearest
  // heading at each level above it (or null).
  type IndexedNode = {
    node: RootContent;
    stack: (string | null)[]; // index 2..6 → heading text at that depth, or null
    /** The deepest non-null heading in the stack. */
    deepestHeading: { depth: number; text: string } | null;
  };

  const indexed: IndexedNode[] = [];
  const stack: (string | null)[] = [null, null, null, null, null, null, null];
  for (let i = bodyStart; i < tree.children.length; i++) {
    const node = tree.children[i];
    if (node.type === `heading`) {
      const depth = node.depth;
      const text = mdToString(node).trim();
      stack[depth] = text;
      // Clear any deeper levels — they belong to the previous sub-tree.
      for (let d = depth + 1; d <= 6; d++) stack[d] = null;
      // Don't index heading nodes themselves — only the content following.
      continue;
    }
    const stackCopy: (string | null)[] = [...stack];
    let deepest: { depth: number; text: string } | null = null;
    for (let d = 6; d >= 2; d--) {
      const heading = stackCopy[d];
      if (heading) {
        deepest = { depth: d, text: heading };
        break;
      }
    }
    indexed.push({ node, stack: stackCopy, deepestHeading: deepest });
  }

  // First pass — collect endpoint headings (any heading immediately followed by a Route).
  // We treat ANY heading depth as a potential endpoint anchor (depth-2 in practice,
  // but be robust). We identify the endpoint by its closest enclosing heading
  // (typically H2) and capture the Route content for method/path.
  interface EndpointSeed {
    headingText: string;
    headingDepth: number;
    method: HttpMethod;
    rawPath: string;
    path: string;
    descriptionNodes: RootContent[];
    /** Set of non-structural sub-heading texts we've already injected into description. */
    seenSubHeadings: Set<string>;
    notes: AdmonitionBlock[];
    examples: DocExample[];
    /** Param groups by kind, keyed by variant label. */
    paramTables: {
      kind: `json` | `query` | `form`;
      variant: string;
      table: Table;
      headingText: string; // the sub-heading title that wrapped this table
    }[];
  }
  const endpointSeeds: EndpointSeed[] = [];
  /** Map from heading text + depth to seed (so we can attach later-found content). */
  const endpointByKey = new Map<string, EndpointSeed>();
  const headingKey = (depth: number, text: string): string =>
    `${depth}::${text}`;

  for (const entry of indexed) {
    const route = findRouteMdx(entry.node);
    if (!route) continue;
    const methodAttr = getMdxAttribute(route, `method`);
    if (!methodAttr) continue;
    // The endpoint's heading is the closest H2 in the stack (most reliable signal).
    // Fallback: deepest heading at any level.
    const anchor =
      (entry.stack[2]
        ? { depth: 2, text: entry.stack[2] }
        : entry.deepestHeading) ?? null;
    if (!anchor) continue;

    const method = methodAttr.toUpperCase() as HttpMethod;
    const rawPath = mdxElementText(route).trim();
    const seed: EndpointSeed = {
      headingText: anchor.text,
      headingDepth: anchor.depth,
      method,
      rawPath,
      path: normalizePath(rawPath),
      descriptionNodes: [],
      seenSubHeadings: new Set(),
      notes: [],
      examples: [],
      paramTables: []
    };
    endpointSeeds.push(seed);
    endpointByKey.set(headingKey(anchor.depth, anchor.text), seed);
  }

  // Second pass — for each non-heading node, attach to its closest endpoint
  // OR record as candidate for object/enum.
  const tableCandidates: { entry: IndexedNode; table: Table }[] = [];
  const admonitionCandidates: {
    entry: IndexedNode;
    admonition: AdmonitionBlock;
  }[] = [];

  for (const entry of indexed) {
    const { node, stack } = entry;
    // Find the closest endpoint among ancestors at depths 2 or 3.
    let endpointSeed: EndpointSeed | undefined;
    for (let d = 6; d >= 2; d--) {
      const t = stack[d];
      if (!t) continue;
      const s = endpointByKey.get(headingKey(d, t));
      if (s) {
        endpointSeed = s;
        break;
      }
    }

    // Admonitions: attach to closest endpoint as notes; ignore otherwise.
    const admonition = nodeAsAdmonition(node);
    if (admonition) {
      if (endpointSeed) endpointSeed.notes.push(admonition);
      else admonitionCandidates.push({ entry, admonition });
      continue;
    }

    // Skip ManualAnchor, mdxjsEsm, html, and other meta nodes.
    if (isMdxElement(node, `ManualAnchor`)) continue;
    if (node.type === `mdxjsEsm`) continue;
    if (node.type === `html`) continue;
    if (node.type === `thematicBreak`) continue;

    // Tables: classify shape and attach as either endpoint params or object/enum candidate.
    if (node.type === `table`) {
      const header = parseTableHeader(node);
      const tableKind = classifyTable(header, entry);
      if (tableKind && endpointSeed && tableKind.kind === `param`) {
        endpointSeed.paramTables.push({
          kind: tableKind.paramKind,
          variant: tableKind.variant,
          table: node,
          headingText: tableKind.headingText
        });
        continue;
      }
      tableCandidates.push({ entry, table: node });
      continue;
    }

    // Code blocks under an endpoint. These typically nest below an H6
    // "Example …" / "Example Response" sub-heading, or sit directly at H2
    // for endpoints whose description includes a snippet. Skip when the
    // closest sub-heading is a known params/structure heading — those are
    // already represented as `jsonParams`/`queryParams`/`formParams`.
    if (node.type === `code` && endpointSeed) {
      const codeNode = node;
      const subHeading = closestSubHeading(stack, endpointSeed.headingDepth);
      if (!subHeading || !isStructuralHeading(subHeading)) {
        endpointSeed.examples.push({
          headingText: subHeading,
          lang: codeNode.lang ?? ``,
          value: (codeNode.value ?? ``).replace(/\s+$/, ``)
        });
      }
      continue;
    }

    // Description prose. Content sits either directly under the endpoint
    // heading OR under a non-structural sub-heading (e.g. ###### Caveats,
    // ###### Limitations). Structural sub-headings like "JSON Params" or
    // "Response Body" are already captured as params tables and skipped.
    //
    // When entering a new non-structural sub-section for the first time,
    // inject a synthetic bolded heading node so the section title renders
    // alongside its content.
    if (endpointSeed) {
      const deepestNonNull = entry.deepestHeading;
      if (deepestNonNull) {
        const underEndpointDirectly =
          deepestNonNull.depth === endpointSeed.headingDepth &&
          deepestNonNull.text === endpointSeed.headingText;

        const underSubHeading =
          deepestNonNull.depth > endpointSeed.headingDepth &&
          !isStructuralHeading(deepestNonNull.text);

        if (underEndpointDirectly || underSubHeading) {
          // Inject sub-heading title once per section.
          if (
            underSubHeading &&
            !endpointSeed.seenSubHeadings.has(deepestNonNull.text)
          ) {
            endpointSeed.seenSubHeadings.add(deepestNonNull.text);
            endpointSeed.descriptionNodes.push(
              synthBoldParagraph(deepestNonNull.text)
            );
          }
          // Exclude the Route line itself.
          if (!nodeContainsRoute(node)) {
            endpointSeed.descriptionNodes.push(node);
          }
        }
      }
    }
  }

  // Build endpoints.
  const endpoints: DocEndpoint[] = endpointSeeds.map((seed) => {
    const jsonParams: DocFieldGroup[] = [];
    const queryParams: DocFieldGroup[] = [];
    const formParams: DocFieldGroup[] = [];
    for (const p of seed.paramTables) {
      const group: DocFieldGroup = {
        variant: p.variant,
        fields: parseFieldsTable(p.table)
      };
      if (p.kind === `json`) jsonParams.push(group);
      else if (p.kind === `query`) queryParams.push(group);
      else if (p.kind === `form`) formParams.push(group);
    }
    return {
      name: seed.headingText,
      slug: slugify(seed.headingText),
      method: seed.method,
      path: seed.path,
      rawPath: seed.rawPath,
      description: nodesToText(seed.descriptionNodes).trim(),
      notes: seed.notes,
      jsonParams,
      queryParams,
      formParams,
      examples: seed.examples
    };
  });

  // Build objects/enums from remaining table candidates.
  const objects: DocObject[] = [];
  const enums: DocEnum[] = [];

  // Group tables by their owning heading. For each group of (heading, [tables]):
  //   - If any table has Field+Type header: it's the object structure for that heading.
  //   - Other tables (Value/Name etc.) become nested enums named after their sub-heading.
  interface TableGroup {
    headingDepth: number;
    headingText: string;
    /** The heading at each depth level above the table — used to detect "nested" sub-headings. */
    deeperHeading: { depth: number; text: string } | null;
    table: Table;
  }
  const groups: TableGroup[] = [];
  for (const { entry, table } of tableCandidates) {
    const { stack } = entry;
    // Identify the OBJECT-level heading: deepest of H2/H3 in stack.
    let objectHeading: { depth: number; text: string } | null = null;
    for (const d of [3, 2]) {
      const t = stack[d];
      if (t) {
        objectHeading = { depth: d, text: t };
        break;
      }
    }
    if (!objectHeading) continue;
    // The SUB-heading that wraps the table (H4–H6), if any.
    let deeperHeading: { depth: number; text: string } | null = null;
    for (let d = 6; d >= 4; d--) {
      const t = stack[d];
      if (t) {
        deeperHeading = { depth: d, text: t };
        break;
      }
    }
    groups.push({
      headingDepth: objectHeading.depth,
      headingText: objectHeading.text,
      deeperHeading,
      table
    });
  }

  // Group by objectHeading.
  const byObjectHeading = new Map<string, TableGroup[]>();
  for (const g of groups) {
    const key = `${g.headingDepth}::${g.headingText}`;
    const arr = byObjectHeading.get(key) ?? [];
    arr.push(g);
    byObjectHeading.set(key, arr);
  }

  for (const [, ts] of byObjectHeading) {
    // Find the structure table for the object (Field+Type).
    const structureGroup = ts.find((t) => {
      const header = parseTableHeader(t.table);
      return header && isStructureHeader(header);
    });
    if (structureGroup) {
      // It's an object. The structure may be under a sub-heading (Structure)
      // or directly under the object heading.
      const fields = parseFieldsTable(structureGroup.table);
      const description = ``; // could be filled in by tracking prose between heading and table
      objects.push({
        name: structureGroup.headingText,
        anchor: null,
        structureAnchor: null,
        description,
        fields
      });
      // Other tables in this group → potential nested enums.
      for (const other of ts) {
        if (other === structureGroup) continue;
        const e = tableAsEnum(other);
        if (e) enums.push(e);
      }
    } else {
      // No structure table — but other tables may be enums.
      for (const t of ts) {
        const e = tableAsEnum(t);
        if (e) enums.push(e);
      }
    }
  }

  // Compute unparsed sections: H2 headings that produced no endpoint and no object/enum.
  const unparsedSections: string[] = [];
  const seenAsEndpoint = new Set(endpointSeeds.map((s) => s.headingText));
  const seenAsObject = new Set(objects.map((o) => o.name));
  // Find all H2 headings in the doc.
  for (const node of tree.children) {
    if (node.type === `heading` && node.depth === 2) {
      const text = mdToString(node).trim();
      if (seenAsEndpoint.has(text)) continue;
      if (seenAsObject.has(text)) continue;
      // Allow obj-suffix mismatch.
      if (
        seenAsObject.has(`${text} Object`) ||
        seenAsObject.has(`${text} Structure`)
      )
        continue;
      unparsedSections.push(text);
    }
  }

  return { title, description, objects, enums, endpoints, unparsedSections };
}

// ─── helpers ───────────────────────────────────────────────────────────────

function extractHeader(children: RootContent[]): {
  title: string;
  description: string;
  bodyStart: number;
} {
  let title = ``;
  let description = ``;
  let i = 0;
  for (; i < children.length; i++) {
    const node = children[i];
    if (node.type === `heading` && node.depth === 1) {
      title = mdToString(node).trim();
      i++;
      break;
    }
  }
  for (; i < children.length; i++) {
    const node = children[i];
    if (node.type === `heading`) break;
    if (node.type === `blockquote`) {
      const text = mdToString(node).trim();
      // Skip the "Documentation Index" header bot every Discord page has.
      if (text.startsWith(`## Documentation Index`)) continue;
      description = text;
      i++;
      break;
    }
  }
  return { title, description, bodyStart: i };
}

function nodeAsAdmonition(node: RootContent): AdmonitionBlock | null {
  if (node.type !== `mdxJsxFlowElement` && node.type !== `mdxJsxTextElement`)
    return null;
  const el = node as unknown as MdxJsxElement;
  if (!el.name) return null;
  if (!ADMONITION_NAMES.has(el.name as AdmonitionBlock[`kind`])) return null;
  // Preserve markdown inside the admonition (backticks, bold, etc.) using
  // the same JSDoc-aware stringifier we use for description paragraphs.
  const content = el.children
    .map((c) => nodeToMarkdown(c))
    .join(` `)
    .replace(/[ \t]+/g, ` `)
    .trim();
  return { kind: el.name as AdmonitionBlock[`kind`], content };
}

function nodeContainsRoute(node: RootContent): boolean {
  return findRouteMdx(node) !== null;
}

/**
 * Headings that introduce structured content already captured elsewhere on
 * the endpoint (parameter tables, response shape). Code blocks sitting
 * under these are skipped to avoid duplicating data we already encode as
 * `jsonParams`/`queryParams`/`formParams`.
 *
 * Match is case-insensitive and tolerant to minor wording shifts ("JSON
 * Params" vs. "JSON/Form Params"). Anything else — `Example Response`,
 * `Example Partial Guild`, etc. — falls through and is captured as a
 * {@link DocExample}.
 */
const STRUCTURAL_HEADING_PATTERNS: RegExp[] = [
  /\b(json|form|query(?:\s*string)?|url)\s*params?\b/i,
  /\bresponse\s*(?:body|structure)\b/i,
  /\bheaders?\b/i,
  /\bparameters?\b/i
];

function isStructuralHeading(heading: string): boolean {
  return STRUCTURAL_HEADING_PATTERNS.some((re) => re.test(heading));
}

/**
 * Given the heading stack for a node and the depth of the owning endpoint,
 * return the text of the deepest sub-heading strictly *below* the endpoint
 * (or `null` if the node sits directly under the endpoint heading).
 */
function closestSubHeading(
  stack: (string | null)[],
  endpointDepth: number
): string | null {
  for (let d = 6; d > endpointDepth; d--) {
    const t = stack[d];
    if (t) return t;
  }
  return null;
}

/**
 * Build a synthetic mdast `paragraph` node containing a single `strong`
 * child holding the supplied text. Used to inject sub-section titles
 * (e.g. "Caveats", "Limitations") into the description stream so they
 * render as `**Caveats**` when the description is stringified.
 */
function synthBoldParagraph(text: string): RootContent {
  return {
    type: `paragraph`,
    children: [
      {
        type: `strong`,
        children: [{ type: `text`, value: text }]
      }
    ]
  } as unknown as RootContent;
}

function findRouteMdx(node: RootContent): MdxJsxElement | null {
  if (isMdxElement(node, `Route`)) return node as unknown as MdxJsxElement;
  if (node.type === `paragraph`) {
    for (const c of node.children) {
      // Inside a paragraph, only inline MDX elements (mdxJsxTextElement) appear.
      // Flow-level mdxJsxFlowElement can't nest under phrasing content.
      if (c.type === `mdxJsxTextElement`) {
        const cAny = c as unknown as MdxJsxElement;
        if (cAny.name === `Route`) return cAny;
      }
    }
  }
  return null;
}

function isMdxElement(
  node: RootContent,
  name: string
): node is RootContent & MdxJsxElement {
  return (
    (node.type === `mdxJsxFlowElement` || node.type === `mdxJsxTextElement`) &&
    (node as unknown as MdxJsxElement).name === name
  );
}

function getMdxAttribute(el: MdxJsxElement, attrName: string): string | null {
  for (const attr of el.attributes) {
    if (attr.type !== `mdxJsxAttribute`) continue;
    if (attr.name !== attrName) continue;
    if (typeof attr.value === `string`) return attr.value;
    if (attr.value && typeof attr.value === `object` && `value` in attr.value) {
      return attr.value.value;
    }
  }
  return null;
}

function mdxElementText(el: MdxJsxElement): string {
  return el.children.map((c) => mdToString(c)).join(``);
}

// ─── table classification ──────────────────────────────────────────────────

interface TableClassification {
  kind: `param` | `object` | `enum` | `unknown`;
  paramKind?: `json` | `query` | `form`;
  variant?: string;
  headingText?: string;
}

interface IndexedNodeView {
  stack: (string | null)[];
  deepestHeading: { depth: number; text: string } | null;
}

function classifyTable(
  header: string[] | null,
  entry: IndexedNodeView
): {
  kind: `param`;
  paramKind: `json` | `query` | `form`;
  variant: string;
  headingText: string;
} | null {
  if (!header) return null;
  // Param tables sit under a heading whose title starts with "JSON Params", "Query String Params", or "Form Params" (or JSON/Form Params).
  // The heading is most often H6 but Discord also uses H3 in some places.
  for (let d = 6; d >= 3; d--) {
    const t = entry.stack[d];
    if (!t) continue;
    const baseTitle = t.replace(/\s*\([^)]*\)\s*$/, ``).trim();
    if (/^JSON Params$/i.test(baseTitle)) {
      return {
        kind: `param`,
        paramKind: `json`,
        variant: extractVariantLabel(t),
        headingText: t
      };
    }
    if (/^Query String Params$/i.test(baseTitle)) {
      return {
        kind: `param`,
        paramKind: `query`,
        variant: extractVariantLabel(t),
        headingText: t
      };
    }
    if (/^Form Params$|^JSON\/Form Params$/i.test(baseTitle)) {
      return {
        kind: `param`,
        paramKind: `form`,
        variant: extractVariantLabel(t),
        headingText: t
      };
    }
    // Only check the deepest heading that's set — anything above is irrelevant.
    break;
  }
  return null;
}

function isStructureHeader(header: string[]): boolean {
  // First column is Field or Name, second is Type.
  return (
    (header[0] === `field` || header[0] === `name`) && header[1] === `type`
  );
}

function tableAsEnum(group: {
  headingText: string;
  deeperHeading: { depth: number; text: string } | null;
  table: Table;
}): DocEnum | null {
  const table = group.table;
  const header = parseTableHeader(table);
  if (!header) return null;
  if (isStructureHeader(header)) return null;

  const descIdx = header.findIndex((c) => c === `description`);
  let valueIdx = header.findIndex((c) => c === `value`);
  if (valueIdx === -1) valueIdx = header.findIndex((c) => c === `id`);
  let labelIdx = header.findIndex((c) => c === `name`);
  if (labelIdx === -1) {
    labelIdx = header.findIndex(
      (c, i) => i !== valueIdx && c !== `description`
    );
  }
  if (valueIdx === -1) {
    if (header.length < 2) return null;
    valueIdx = header.findIndex(
      (c, i) => i !== labelIdx && c !== `description`
    );
  }
  if (valueIdx === -1 || labelIdx === -1) return null;

  const rows = parseTableRowsAsRecord(table, header).map((row) => ({
    value: row[header[valueIdx]] ?? ``,
    name: row[header[labelIdx]] ?? ``,
    description: descIdx >= 0 ? (row[header[descIdx]] ?? null) : null
  }));
  if (rows.length === 0) return null;

  // Enum name: if there's a deeper-heading (level 4-6), use it. Otherwise use the object-level heading.
  const name = group.deeperHeading
    ? group.deeperHeading.text
    : stripObjectSuffix(group.headingText);
  return { name, anchor: null, rows };
}

function parseTableHeader(table: Table): string[] | null {
  const headerRow = table.children[0];
  if (!headerRow || headerRow.type !== `tableRow`) return null;
  return headerRow.children.map((cell) =>
    mdToString(cell).trim().toLowerCase()
  );
}

function parseTableRowsAsRecord(
  table: Table,
  header: string[]
): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < table.children.length; i++) {
    const row = table.children[i];
    if (row.type !== `tableRow`) continue;
    const record: Record<string, string> = {};
    for (let c = 0; c < header.length; c++) {
      const cell = row.children[c];
      record[header[c]] = cell ? cellToMarkdown(cell) : ``;
    }
    rows.push(record);
  }
  return rows;
}

function parseFieldsTable(table: Table): DocField[] {
  const header = parseTableHeader(table);
  if (!header) return [];
  const fieldIdx = header.findIndex((c) => c === `field` || c === `name`);
  const typeIdx = header.findIndex((c) => c === `type`);
  const descIdx = header.findIndex((c) => c === `description`);
  const reqIdx = header.findIndex((c) => c === `required`);
  const defaultIdx = header.findIndex((c) => c === `default`);
  if (fieldIdx === -1 || typeIdx === -1) return [];

  const fields: DocField[] = [];
  for (let i = 1; i < table.children.length; i++) {
    const row = table.children[i];
    if (row.type !== `tableRow`) continue;
    const cells = row.children;
    const fieldText = (
      cells[fieldIdx] ? mdToString(cells[fieldIdx]) : ``
    ).trim();
    const typeCell = cells[typeIdx];
    const descText =
      descIdx >= 0 && cells[descIdx] ? cellToMarkdown(cells[descIdx]) : ``;
    const reqText =
      reqIdx >= 0 && cells[reqIdx]
        ? mdToString(cells[reqIdx]).trim().toLowerCase()
        : ``;
    const defaultText =
      defaultIdx >= 0 && cells[defaultIdx]
        ? mdToString(cells[defaultIdx]).trim()
        : ``;

    let optional = false;
    let rawName = fieldText;
    if (rawName.endsWith(`?`)) {
      optional = true;
      rawName = rawName.slice(0, -1);
    }

    fields.push({
      rawName,
      name: snakeToCamel(rawName),
      optional,
      type: parseTypeCell(typeCell),
      description: descText,
      required:
        reqIdx >= 0
          ? reqText === `true`
            ? true
            : reqText === `false`
              ? false
              : null
          : null,
      default: defaultIdx >= 0 ? defaultText || null : null
    });
  }
  return fields;
}

function cellToMarkdown(cell: RootContent | PhrasingContent): string {
  if (cell.type === `tableCell`) {
    return cell.children.map(phrasingToMarkdown).join(``);
  }
  return mdToString(cell);
}

function phrasingToMarkdown(node: PhrasingContent): string {
  switch (node.type) {
    case `text`:
      return node.value;
    case `inlineCode`:
      return `\`${node.value}\``;
    case `strong`:
      return `**${node.children.map(phrasingToMarkdown).join(``)}**`;
    case `emphasis`:
      return `*${node.children.map(phrasingToMarkdown).join(``)}*`;
    case `link`:
      return `[${node.children.map(phrasingToMarkdown).join(``)}](${node.url})`;
    case `html`:
      return node.value;
    case `break`:
      return `\n`;
    default: {
      const maybeChildren = (node as { children?: PhrasingContent[] }).children;
      if (maybeChildren) return maybeChildren.map(phrasingToMarkdown).join(``);
      return mdToString(node as unknown as PhrasingContent);
    }
  }
}

function parseTypeCell(cell: RootContent | undefined): DocFieldType {
  if (!cell) return { kind: `raw`, raw: ``, nullable: false };
  let text =
    cell.type === `tableCell`
      ? cell.children.map(phrasingToMarkdown).join(``).trim()
      : mdToString(cell).trim();

  let nullable = false;
  if (text.startsWith(`?`)) {
    nullable = true;
    text = text.slice(1).trim();
  }

  let objectSuffix = false;
  const objectMatch = /\s+objects?\s*$/i.exec(text);
  if (objectMatch) {
    text = text.slice(0, objectMatch.index).trim();
    objectSuffix = true;
  }

  const arrayMatch = /^array(?:\s+of\s+(.+))?$/i.exec(text);
  if (arrayMatch) {
    if (!arrayMatch[1]) {
      return {
        kind: `array`,
        element: { kind: `raw`, raw: `unknown`, nullable: false },
        nullable
      };
    }
    let elementText = arrayMatch[1].replace(/^partial\s+/i, ``).trim();
    if (/^strings?$/i.test(elementText)) elementText = `string`;
    else if (/^snowflakes?$/i.test(elementText)) elementText = `snowflake`;
    else if (/^integers?$/i.test(elementText)) elementText = `integer`;
    const fakeCell: PhrasingContent = { type: `text`, value: elementText };
    const wrapped: RootContent = {
      type: `tableCell`,
      children: [fakeCell]
    } as RootContent;
    return { kind: `array`, element: parseTypeCell(wrapped), nullable };
  }

  const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)\s*$/.exec(text);
  if (linkMatch) {
    return {
      kind: `ref`,
      refName: linkMatch[1].trim(),
      refUrl: linkMatch[2].trim(),
      nullable,
      objectSuffix
    };
  }

  const lower = text.toLowerCase();
  if (PRIMITIVE_TYPES.has(lower)) {
    return { kind: `primitive`, name: lower, nullable };
  }

  return { kind: `raw`, raw: text, nullable };
}

// ─── misc helpers ──────────────────────────────────────────────────────────

function nodesToText(nodes: RootContent[]): string {
  return nodes
    .filter(
      (n) =>
        n.type !== `html` || !(n as { value: string }).value.startsWith(`<!--`)
    )
    .map((n) => nodeToMarkdown(n))
    .join(`\n\n`)
    .replace(/\n{3,}/g, `\n\n`);
}

/**
 * Markdown-preserving stringifier for top-level nodes (paragraphs, lists,
 * etc.). Unlike `mdToString` from `mdast-util-to-string` — which strips all
 * markdown to plain text — this keeps `` `code` ``, `**bold**`, `*italics*`,
 * and *external* `[text](url)` links intact. Discord-internal cross-doc
 * links (e.g. `/developers/resources/channel#channel-object`) are flattened
 * to their display text so a downstream pass can re-link them as
 * `{@link Name | display}` references against the local type registry.
 *
 * Other block types fall back to plain text.
 */
function nodeToMarkdown(node: RootContent): string {
  switch (node.type) {
    case `paragraph`:
      return node.children.map(phrasingForJsDoc).join(``);
    case `list`: {
      const marker = node.ordered ? `1.` : `-`;
      return node.children
        .map((item) => {
          const text = (item.children as RootContent[])
            .map((c) => nodeToMarkdown(c))
            .join(`\n\n`);
          return `${marker} ${text}`;
        })
        .join(`\n`);
    }
    default:
      return mdToString(node);
  }
}

/**
 * Like {@link phrasingToMarkdown}, but tailored for JSDoc prose:
 * Discord-internal links (`/developers/...`) are flattened to their display
 * text. External links are preserved as full markdown so the JSDoc can show
 * a clickable URL.
 */
function phrasingForJsDoc(node: PhrasingContent): string {
  if (node.type === `link`) {
    const display = node.children.map(phrasingForJsDoc).join(``);
    if (node.url.startsWith(`/developers/`)) return display;
    return `[${display}](${node.url})`;
  }
  if (node.type === `text`) return node.value;
  if (node.type === `inlineCode`) return `\`${node.value}\``;
  if (node.type === `strong`)
    return `**${node.children.map(phrasingForJsDoc).join(``)}**`;
  if (node.type === `emphasis`)
    return `*${node.children.map(phrasingForJsDoc).join(``)}*`;
  if (node.type === `html`) return node.value;
  if (node.type === `break`) return `\n`;
  const maybeChildren = (node as { children?: PhrasingContent[] }).children;
  if (maybeChildren) return maybeChildren.map(phrasingForJsDoc).join(``);
  return mdToString(node as unknown as PhrasingContent);
}

function normalizePath(rawPath: string): string {
  // Discord placeholders look like `[\{webhook.id}](url)` or `[\{user.id}](url)`.
  // The repo convention uses the SUFFIX as the param name (so `webhook.token`
  // becomes `:token`, `user.id` becomes `:user`), with a fallback to the
  // PREFIX when only a single placeholder uses that prefix.
  //
  // Standalone placeholders like `{instance_id}` (no dot prefix) get
  // converted to `:instanceId` (camelCase, matching repo convention).
  return rawPath
    .replace(
      /\[\\?\{([^.}]+)\.([^}]+)\}\]\([^)]+\)/g,
      (_, prefix: string, suffix: string) => {
        const cleanSuffix = suffix.replace(/\\_/g, `_`);
        return cleanSuffix === `id`
          ? `:${prefix}`
          : `:${snakeToCamel(cleanSuffix)}`;
      }
    )
    .replace(
      /\[\\?\{([^}]+)\}\]\([^)]+\)/g,
      (_, raw: string) => `:${snakeToCamel(raw.replace(/\\_/g, `_`))}`
    )
    .replace(
      /\\?\{([^.}]+)\.([^}]+)\}/g,
      (_, prefix: string, suffix: string) => {
        const cleanSuffix = suffix.replace(/\\_/g, `_`);
        return cleanSuffix === `id`
          ? `:${prefix}`
          : `:${snakeToCamel(cleanSuffix)}`;
      }
    )
    .replace(
      /\\?\{([^}]+)\}/g,
      (_, raw: string) => `:${snakeToCamel(raw.replace(/\\_/g, `_`))}`
    );
}

function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ``)
    .trim()
    .replace(/\s+/g, `-`);
}

function snakeToCamel(name: string): string {
  return name.replace(/_([a-zA-Z])/g, (_, ch) => ch.toUpperCase());
}

function extractVariantLabel(headingText: string): string {
  const m = /\(([^)]+)\)\s*$/.exec(headingText);
  return m ? m[1].trim() : ``;
}

function stripObjectSuffix(text: string): string {
  return text
    .replace(/\s+Object$/i, ``)
    .replace(/\s+Structure$/i, ``)
    .trim();
}

// ─── CLI ───────────────────────────────────────────────────────────────────

const invokedDirectly = process.argv[1]
  ?.replace(/\\/g, `/`)
  .endsWith(`scripts/docs/parse.ts`);

if (invokedDirectly) {
  const args = process.argv.slice(2);
  const jsonMode = args.includes(`--json`);
  const target = args.find((a) => !a.startsWith(`--`));
  if (!target) {
    console.error(
      `usage: node --experimental-strip-types scripts/docs/parse.ts [--json] <relative-path-under-.discord-docs>`
    );
    process.exit(1);
  }
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), `../..`);
  const filePath = join(projectRoot, `.discord-docs`, target);
  if (!existsSync(filePath)) {
    console.error(`not found: ${filePath}`);
    process.exit(1);
  }
  const md = readFileSync(filePath, `utf8`);
  const result = parseResource(md);
  if (jsonMode) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    summarize(result);
  }
}

function summarize(r: DocResource): void {
  console.log(`# ${r.title}`);
  console.log(`> ${r.description}\n`);
  console.log(`Objects (${r.objects.length}):`);
  for (const o of r.objects) {
    console.log(`  - ${o.name} (${o.fields.length} fields)`);
  }
  console.log(`\nEnums (${r.enums.length}):`);
  for (const e of r.enums) {
    console.log(`  - ${e.name} (${e.rows.length} rows)`);
  }
  console.log(`\nEndpoints (${r.endpoints.length}):`);
  for (const ep of r.endpoints) {
    const params: string[] = [];
    if (ep.jsonParams.length) {
      params.push(
        `json[${ep.jsonParams.reduce((s, g) => s + g.fields.length, 0)}]`
      );
    }
    if (ep.queryParams.length) {
      params.push(
        `query[${ep.queryParams.reduce((s, g) => s + g.fields.length, 0)}]`
      );
    }
    if (ep.formParams.length) {
      params.push(
        `form[${ep.formParams.reduce((s, g) => s + g.fields.length, 0)}]`
      );
    }
    console.log(
      `  - ${ep.method.padEnd(6)} ${ep.path.padEnd(50)} ${ep.name}${
        params.length ? ` (${params.join(`, `)})` : ``
      }`
    );
  }
  if (r.unparsedSections.length > 0) {
    console.log(`\nUnparsed sections (${r.unparsedSections.length}):`);
    for (const s of r.unparsedSections) console.log(`  - ${s}`);
  }
}
