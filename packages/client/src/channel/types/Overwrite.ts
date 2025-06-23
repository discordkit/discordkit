import { snowflake } from "@discordkit/core";
import {
  object,
  union,
  literal,
  string,
  minLength,
  type InferOutput,
  pipe
} from "valibot";

export const overwriteSchema = object({
  /** role or user id */
  id: snowflake,
  /** either 0 (role) or 1 (member) */
  type: union([literal(0), literal(1)]),
  /** permission bit set */
  allow: pipe(string(), minLength(1)),
  /** permission bit set */
  deny: pipe(string(), minLength(1))
});

export type Overwrite = InferOutput<typeof overwriteSchema>;
