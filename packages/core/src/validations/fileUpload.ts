import * as v from "valibot";
import { isObject } from "../utils/isObject.js";

/**
 * The shape of a single file upload — used wherever a Discord endpoint
 * accepts an attached file via `multipart/form-data`.
 *
 * @example
 * ```ts
 * await executeWebhook({
 *   webhook: "...",
 *   token: "...",
 *   body: {
 *     content: "Look at this!",
 *     files: [
 *       { filename: "photo.png", content: new Blob([bytes], { type: "image/png" }) }
 *     ]
 *   }
 * });
 * ```
 */
export interface FileUpload {
  /** Filename including extension. Required for the multipart `Content-Disposition` header. */
  filename: string;
  /** The binary content. Accepts a web-standard `Blob` or `File`. */
  content: Blob;
  /** Optional MIME type. If omitted, taken from the `Blob`'s `type` property. */
  contentType?: string;
}

/** Type guard — true if `val` looks like a {@link FileUpload}. */
export const isFileUpload = (val: unknown): val is FileUpload => {
  if (!isObject(val)) return false;
  const record = val as Record<string, unknown>;
  // Blob is a global in Node 18+, the browser, and all current runtimes.
  // We test via duck-typing on `arrayBuffer` to avoid the `instanceof` cross-realm pitfall.
  return (
    typeof record.filename === `string` &&
    typeof (record.content as { arrayBuffer?: unknown })?.arrayBuffer ===
      `function`
  );
};

/**
 * Valibot schema for a single file upload. Validates the shape and
 * surfaces a clean TypeScript type to consumers.
 */
export const fileUpload: v.GenericSchema<FileUpload> = v.pipe(
  v.custom<FileUpload>(isFileUpload, `Expected a FileUpload object`),
  v.title(`fileUpload`)
);

/**
 * Walks a value and returns all {@link FileUpload}s within it, along
 * with the path each one occupies.
 */
export const collectFileUploads = (
  val: unknown,
  path: ReadonlyArray<string | number> = []
): ReadonlyArray<{
  readonly path: ReadonlyArray<string | number>;
  readonly file: FileUpload;
}> => {
  if (isFileUpload(val)) return [{ path, file: val }];
  if (Array.isArray(val)) {
    return val.flatMap((item, i) => collectFileUploads(item, [...path, i]));
  }
  if (isObject(val)) {
    return Object.entries(val).flatMap(([key, item]) =>
      collectFileUploads(item, [...path, key])
    );
  }
  return [];
};

/**
 * Returns a deep copy of `body` with the value at `path` replaced by
 * `replacement`. Pure: never mutates `body` or any of its children.
 */
const replaceAtPath = (
  body: unknown,
  path: ReadonlyArray<string | number>,
  replacement: unknown
): unknown => {
  if (path.length === 0) return replacement;
  const [head, ...rest] = path;
  if (Array.isArray(body)) {
    return body.map((item, index) =>
      index === head ? replaceAtPath(item, rest, replacement) : item
    );
  }
  if (isObject(body)) {
    return Object.fromEntries(
      Object.entries(body).map(([key, item]) => [
        key,
        key === head ? replaceAtPath(item, rest, replacement) : item
      ])
    );
  }
  return body;
};

/**
 * Given a body that contains one or more {@link FileUpload}s, produce
 * a `FormData` payload Discord can consume.
 *
 * Files are appended as `files[n]` parts; the rest of the body is
 * snake_cased and JSON-stringified into a `payload_json` part.
 *
 * Each FileUpload in the body is replaced by its attachment placeholder
 * `{ id: n }` so that an `attachments` array (if present) can reference
 * uploads by index. Discord matches these placeholders to the
 * corresponding `files[n]` parts.
 */
export const toMultipartBody = (
  body: unknown,
  // Loose enough to accept the real `toSnakeKeys` signature
  // (`<T extends object>(o: T) => SnakeCasedPropertiesDeep<T>`).
  // We cast at the call site since the payload is structurally an object.
  toSnakeKeys: (val: object) => unknown
): FormData => {
  const uploads = collectFileUploads(body);
  if (uploads.length === 0) {
    throw new Error(
      `toMultipartBody called with a body containing no FileUploads`
    );
  }
  // Build the payload immutably: fold each upload's placeholder into the body.
  const payload = uploads.reduce<unknown>(
    (acc, { path }, index) => replaceAtPath(acc, path, { id: index }),
    body
  );
  // Compose the FormData parts.
  const fileEntries = uploads.map(({ file }, index) => {
    const blob =
      file.contentType && file.content.type !== file.contentType
        ? new Blob([file.content], { type: file.contentType })
        : file.content;
    return [`files[${index}]`, blob, file.filename] as const;
  });
  // `payload` is `unknown` from the reduce; structurally it's always
  // the same shape as `body`, which must be an object to contain uploads.
  const payloadJson = new Blob(
    [JSON.stringify(toSnakeKeys(payload as object))],
    { type: `application/json` }
  );
  // The single side-effect: append parts to the FormData sink.
  const form = new FormData();
  fileEntries.forEach(([name, blob, filename]) =>
    form.append(name, blob, filename)
  );
  form.append(`payload_json`, payloadJson);
  return form;
};

/**
 * Sentinel symbol used to mark a validated body as multipart-eligible.
 * Read by the request layer at serialization time.
 *
 * The marker is attached as a non-enumerable property on the parsed
 * body so it doesn't leak into JSON serialization or the TypeScript
 * output type.
 */
export const MULTIPART_MARKER = Symbol.for(`@discordkit/core/multipart`);

/**
 * Returns true if `body` should be serialized as `multipart/form-data`.
 *
 * Two signals trigger multipart serialization:
 *
 * 1. **Schema-tagged** — the body was parsed by a {@link multipart}-wrapped
 *    schema and at least one {@link FileUpload} was present. The wrapper
 *    stamps a non-enumerable {@link MULTIPART_MARKER} on the parsed value.
 *    This is the fast path for the validated flow (e.g., `toValidated`).
 *
 * 2. **Value-detected** — the body contains a {@link FileUpload} anywhere
 *    in its shape, regardless of whether it was validated. This safety net
 *    keeps consumers who bypass validation from silently dropping their
 *    files into a JSON body where `Blob` would serialize as `{}`.
 *
 * Either signal switches the request to multipart.
 */
export const shouldSerializeAsMultipart = (body: unknown): boolean => {
  if (typeof body !== `object` || body === null) return false;
  if ((body as Record<symbol, unknown>)[MULTIPART_MARKER] === true) return true;
  return collectFileUploads(body).length > 0;
};

/**
 * Wraps an object schema to mark its body as a potential multipart payload.
 *
 * Use {@link multipart} instead of `v.object` whenever an endpoint's body
 * may contain one or more {@link fileUpload} fields (or arrays of them,
 * or optional uploads). The wrapper validates the same shape as
 * `v.object(entries)`. At validation time, the wrapper inspects the
 * parsed body for {@link FileUpload}s. If any are present, it stamps a
 * non-enumerable {@link MULTIPART_MARKER} on the result; the request
 * layer reads that marker at serialization time to choose between
 * `multipart/form-data` (marker present) and `application/json`
 * (marker absent).
 *
 * Pass `{ partial: true }` for endpoints where every field is optional —
 * the wrapper applies `v.partial(...)` to the inner object before piping
 * the transform. `v.partial` itself can't wrap the piped result (it only
 * accepts plain object schemas), so the option lives here.
 *
 * @example
 * ```ts
 * import { multipart, fileUpload } from "@discordkit/core";
 * import * as v from "valibot";
 *
 * export const updateAvatarSchema = v.object({
 *   body: multipart({
 *     avatar: v.exactOptional(fileUpload),
 *     bio: v.exactOptional(v.string())
 *   })
 * });
 *
 * // Every field optional:
 * export const editMessageSchema = v.object({
 *   body: multipart(
 *     { content: v.string(), files: v.array(fileUpload) },
 *     { partial: true }
 *   )
 * });
 * ```
 */
export function multipart<TEntries extends v.ObjectEntries>(
  entries: TEntries
): v.GenericSchema<v.InferOutput<v.ObjectSchema<TEntries, undefined>>>;
export function multipart<TEntries extends v.ObjectEntries>(
  entries: TEntries,
  options: { partial: true }
): v.GenericSchema<
  v.InferOutput<
    v.SchemaWithPartial<v.ObjectSchema<TEntries, undefined>, undefined>
  >
>;
export function multipart<TEntries extends v.ObjectEntries>(
  entries: TEntries,
  options?: { partial?: boolean }
): v.GenericSchema<unknown> {
  const base = v.object(entries);
  const inner = options?.partial ? v.partial(base) : base;
  // Wrap with a transform that stamps the marker if any FileUploads are present.
  return v.pipe(
    inner,
    v.transform((parsed) => {
      const hasFiles = collectFileUploads(parsed).length > 0;
      if (!hasFiles) return parsed;
      return Object.defineProperty(parsed, MULTIPART_MARKER, {
        value: true,
        enumerable: false,
        configurable: false,
        writable: false
      });
    })
  );
}
