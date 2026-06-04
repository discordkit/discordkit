/**
 * T4: JSDoc renderer.
 *
 * Reads a parsed `DocEndpoint` (from T2's `parseResource`) and emits the
 * canonical JSDoc block we use for exported fetchers:
 *
 *   /**
 *    * ### [<Title>](<doc URL>)
 *    *
 *    * **<METHOD>** `<path>`
 *    *
 *    * <description>
 *    *
 *    * > [!NOTE]
 *    * > <note text>
 *    *\/
 *
 * Each rendered block is plain text (no leading `/**` or trailing `*\/`),
 * so callers can wrap it however they need to.
 *
 * Public surface:
 *   - `renderEndpointJsDoc(endpoint, opts)` → string (the JSDoc body)
 *   - `formatBlock(body)` → string (wraps a body with `/** … *\/`)
 *
 * Dependencies are kept minimal. We import only the types from T2 so we
 * can also be used downstream by tools that synthesize endpoints from
 * other sources.
 */

import type { AdmonitionBlock, DocEndpoint, DocExample } from "./parse.ts";

export interface RenderOptions {
  /** Base URL for the docs page that contains this endpoint. Used as the prefix of the heading link. */
  pageUrl: string;
  /** Optional indent string applied to each non-blank rendered line (default ` * `). */
  prefix?: string;
}

/**
 * Render the body of an endpoint's JSDoc block. The output excludes the
 * `/**` / `*\/` markers and has no leading `*` on each line; pass it
 * through {@link formatBlock} to get a ready-to-paste comment.
 */
export function renderEndpointJsDoc(
  endpoint: DocEndpoint,
  opts: RenderOptions
): string {
  const link = `${opts.pageUrl}#${endpoint.slug}`;
  const lines: string[] = [];

  // Heading link.
  lines.push(`### [${endpoint.name}](${link})`);
  lines.push(``);

  // Method + path.
  lines.push(`**${endpoint.method}** \`${endpoint.path}\``);

  // Description (one blank line, then the prose joined onto one logical
  // line — JSDoc readers wrap on display).
  const description = endpoint.description.trim();
  if (description) {
    lines.push(``);
    lines.push(description);
  }

  // Admonitions.
  for (const note of endpoint.notes) {
    lines.push(``);
    lines.push(...renderAdmonition(note));
  }

  // Example blocks (code snippets nested under headings like
  // `###### Example Partial Guild`).
  for (const example of endpoint.examples) {
    lines.push(``);
    lines.push(...renderExample(example));
  }

  return lines.join(`\n`);
}

/**
 * Wrap a plain rendered body (e.g. the output of {@link renderEndpointJsDoc})
 * with `/** … *\/` markers and a leading ` * ` on each line.
 */
export function formatBlock(body: string): string {
  const lines = body.split(`\n`);
  const wrapped = lines.map((line) =>
    line.length === 0 ? ` *` : ` * ${line}`
  );
  return [`/**`, ...wrapped, ` */`].join(`\n`);
}

/**
 * Mintlify admonition kinds map onto GitHub-flavored markdown alerts in our
 * JSDoc. The mapping mirrors the convention used by hand-written endpoint
 * files: `Warning`/`Warn`/`Danger` → `WARNING`; `Note` → `NOTE`; `Tip` →
 * `TIP`; `Info` → `NOTE` (the closest GFM alert).
 */
function admonitionKind(kind: AdmonitionBlock[`kind`]): string {
  switch (kind) {
    case `Warning`:
    case `Warn`:
    case `Danger`:
      return `WARNING`;
    case `Tip`:
      return `TIP`;
    case `Note`:
    case `Info`:
    default:
      return `NOTE`;
  }
}

function renderAdmonition(note: AdmonitionBlock): string[] {
  const kind = admonitionKind(note.kind);
  const content = note.content.trim();
  // GFM alert: `> [!KIND]\n>\n> body`
  const lines: string[] = [`> [!${kind}]`, `>`];
  for (const para of content.split(/\n{2,}/)) {
    for (const line of para.split(/\n/)) {
      lines.push(`> ${line.trimEnd()}`);
    }
  }
  return lines;
}

/**
 * Render an inline code-block example inside JSDoc as:
 *
 *     **<heading text>**
 *
 *     ```<lang>
 *     <body>
 *     ```
 *
 * The heading is bolded (rather than emitted as a markdown header) because
 * JSDoc consumers like TSDoc render `#` lines as IDE outline anchors rather
 * than inline text. Bold reads consistently across hover-help, generated
 * type-doc, and the IDE preview.
 */
function renderExample(example: DocExample): string[] {
  const lines: string[] = [];
  if (example.headingText) {
    lines.push(`**${example.headingText}**`, ``);
  }
  lines.push(`\`\`\`${example.lang}`);
  for (const line of example.value.split(`\n`)) {
    lines.push(line);
  }
  lines.push(`\`\`\``);
  return lines;
}
