import { isObject } from "@discordkit/core/utils/isObject";
import { toCamelCase } from "@discordkit/core/utils/toCamelCase";
import type { Finding, Path, PathSegment } from "../findings.js";

/** Where one object or array of the normalised value came from: its path in the caller's input, and each converted key's original spelling. */
interface Origin {
  path: Path;
  keys: Map<string, string>;
}

export type Origins = WeakMap<object, Origin>;

export interface Camelised {
  value: unknown;
  origins: Origins;
  findings: Finding[];
}

/** Assigns without invoking the `__proto__` setter, which a parsed JSON key of that name would otherwise trigger. */
const assign = (
  target: Record<string, unknown>,
  key: string,
  value: unknown
): void => {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    writable: true,
    configurable: true
  });
};

/**
 * Converts every object key from snake_case to camelCase with `@discordkit/core`'s `toCamelCase`, the same conversion the client applies to Discord's responses, and leaves keys already in camelCase as they are, so a mix of the two comes out uniform.
 *
 * Keys that are data rather than field names must survive untouched: a scene's context is keyed by ids and file names, and `my_card.webp` must not become `myCard.webp`. `preserveKeys` names those objects by their path in the output. Core's `toCamelKeys` converts every key in a tree, which is why this walks the tree itself.
 *
 * Alongside the value it records where each object came from, so a finding about the normalised value can point into the input as the caller wrote it.
 */
export const camelise = (
  input: unknown,
  preserveKeys: (path: readonly PathSegment[]) => boolean = () => false
): Camelised => {
  const origins: Origins = new WeakMap();
  const findings: Finding[] = [];
  const walk = (value: unknown, inputPath: Path, outputPath: Path): unknown => {
    if (Array.isArray(value)) {
      const out = value.map((item: unknown, index) =>
        walk(item, [...inputPath, index], [...outputPath, index])
      );
      origins.set(out, { path: inputPath, keys: new Map() });
      return out;
    }
    if (!isObject(value)) return value;
    const out: Record<string, unknown> = {};
    const keys = new Map<string, string>();
    const preserve = preserveKeys(outputPath);
    for (const [key, item] of Object.entries(value)) {
      const name = preserve ? key : toCamelCase(key);
      const earlier = keys.get(name);
      if (earlier !== undefined) {
        // Keep the spelling that was already camelCase, whichever came first.
        const keep = key === name ? key : earlier;
        findings.push({
          code: `duplicate-key`,
          severity: `warning`,
          path: [...inputPath, keep === key ? earlier : key],
          message: `\`${earlier}\` and \`${key}\` are the same field, spelled once in snake_case and once in camelCase, so only one of them can be used. The camelCase one, \`${name}\`, was kept and the other ignored. Remove the spelling you did not mean, so the payload says one thing.`
        });
        if (keep !== key) continue;
      }
      keys.set(name, key);
      assign(out, name, walk(item, [...inputPath, key], [...outputPath, name]));
    }
    origins.set(out, { path: inputPath, keys });
    return out;
  };
  return { value: walk(input, [], []), origins, findings };
};

const child = (node: object, segment: PathSegment): unknown => {
  if (Array.isArray(node)) {
    const items: unknown[] = node;
    return typeof segment === `number` ? items[segment] : undefined;
  }
  return isObject(node) ? node[String(segment)] : undefined;
};

/**
 * Turns a path into the normalised value back into a path into the caller's input, using the origins `camelise` recorded. A step through an object intake made up (the scene around a bare payload, say) restarts at the input's root, since that is the closest thing the caller wrote.
 */
export const toInputPath = (
  root: unknown,
  path: readonly PathSegment[],
  origins: Origins
): Path => {
  let node: unknown = root;
  let result: Path = [];
  for (const segment of path) {
    if (typeof node !== `object` || node === null) {
      result = [...result, segment];
      continue;
    }
    const origin = origins.get(node);
    result =
      origin === undefined
        ? []
        : [
            ...origin.path,
            typeof segment === `string`
              ? (origin.keys.get(segment) ?? segment)
              : segment
          ];
    node = child(node, segment);
  }
  return result;
};
