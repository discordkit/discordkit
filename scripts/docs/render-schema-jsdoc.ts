/**
 * T5: Schema-block JSDoc renderer.
 *
 * Produces a canonical block-level JSDoc comment for an exported schema
 * (object or enum), matching the endpoint JSDoc style we settled on in
 * Pass 2a:
 *
 *   ### [<Object Name>](<doc URL>#<anchor>)
 *
 *   <description prose>
 *
 * Pass 2d is intentionally block-level only. Field-level descriptions
 * already exist (camelCase, tuned by hand) and rewriting them in bulk
 * would clobber curated wording without enough signal-to-noise. A
 * follow-up pass can revisit field comments once the block-level
 * structure is established and we know which fields drifted.
 *
 * Public surface:
 *   - `renderObjectJsDoc(object, opts)` → string (body)
 *   - `renderEnumJsDoc(enumDef, opts)` → string (body)
 *   - re-exports `formatBlock` from render-jsdoc.ts for convenience
 */

import type { DocObject, DocEnum } from "./parse.ts";
import { formatBlock } from "./render-jsdoc.ts";

export { formatBlock };

export interface SchemaRenderOptions {
  /** Base URL of the docs page that contains this object/enum. */
  pageUrl: string;
  /**
   * If set, override the docs-derived display name (the schema name used
   * by the codebase often drops the "Object" or "Structure" suffix that
   * Discord's headings carry).
   */
  displayName?: string;
}

/**
 * Render a `DocObject` to a JSDoc body (no surrounding `/** … *\/`).
 * Call `formatBlock(body)` to wrap it for emission.
 */
export function renderObjectJsDoc(
  object: DocObject,
  opts: SchemaRenderOptions
): string {
  const name = opts.displayName ?? stripSuffixes(object.name);
  const url = object.anchor
    ? `${opts.pageUrl}#${object.anchor}`
    : opts.pageUrl;
  const lines: string[] = [];
  lines.push(`### [${name}](${url})`);
  const description = object.description.trim();
  if (description) {
    lines.push(``);
    lines.push(description);
  }
  return lines.join(`\n`);
}

/**
 * Render a `DocEnum` to a JSDoc body. Enums get the same heading shape
 * as objects; the per-member descriptions live on individual enum keys
 * and aren't reshaped here.
 */
export function renderEnumJsDoc(
  enumDef: DocEnum,
  opts: SchemaRenderOptions
): string {
  const name = opts.displayName ?? stripSuffixes(enumDef.name);
  const url = enumDef.anchor
    ? `${opts.pageUrl}#${enumDef.anchor}`
    : opts.pageUrl;
  return `### [${name}](${url})`;
}

/**
 * Drop common "object" / "structure" / "enum" suffixes from a doc
 * heading so the rendered display name matches what we name the
 * schema export. `User Object` → `User`; `Activity Flags Enum` →
 * `Activity Flags`.
 */
function stripSuffixes(name: string): string {
  return name
    .replace(/\s+(Object|Structure|Enum)\s*$/i, ``)
    .trim();
}
