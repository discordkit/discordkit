import * as v from "valibot";
import { isObject } from "@discordkit/core/utils/isObject";
import { componentSchema } from "@discordkit/client/components/types/Component";
import { componentName } from "../components.js";
import type { Finding, IntakeCode, Path, PathSegment } from "../findings.js";

type Issue = v.BaseIssue<unknown>;

/** Maps a path into the normalised value to the path the caller should see. */
export type Translate = (path: readonly PathSegment[]) => Path;

const issuePath = (issue: Issue): Path =>
  (issue.path ?? []).map((item) =>
    typeof item.key === `number` ? item.key : String(item.key)
  );

const fieldName = (path: Path): string => {
  const last = path.at(-1);
  return last === undefined
    ? `The input`
    : typeof last === `number`
      ? `Item ${String(last)}`
      : `\`${last}\``;
};

const isArrayLength = (issue: Issue): boolean => Array.isArray(issue.input);

/** What the issue says happened, in words, without valibot's message: `boundedArray` in `@discordkit/core` replaces the message of every issue nested under it with its own, so a nested issue's `message` cannot be trusted. Its type, `expected` and `received` can. */
const whatHappened = (issue: Issue, field: string, last: unknown): string => {
  const requirement =
    typeof issue.requirement === `number` ? issue.requirement : undefined;
  switch (issue.type) {
    case `min_length`:
    case `max_length`:
    case `length`: {
      const bound =
        issue.type === `min_length`
          ? `at least ${String(requirement)}`
          : issue.type === `max_length`
            ? `at most ${String(requirement)}`
            : `exactly ${String(requirement)}`;
      return isArrayLength(issue)
        ? `${field} holds ${issue.received} items, and must hold ${bound}.`
        : `${field} is ${issue.received} characters long, and must be ${bound}.`;
    }
    case `min_value`:
    case `max_value`:
      return `${field} is ${issue.received}, and must be ${issue.type === `min_value` ? `at least` : `at most`} ${String(issue.requirement)}.`;
    case `integer`:
      return `${field} is ${issue.received}, and must be a whole number.`;
    case `url`:
      return `${field} is ${issue.received}, which is not a URL.`;
    case `iso_timestamp`:
      return `${field} is ${issue.received}, which is not an ISO 8601 timestamp such as "2026-11-25T11:05:00Z".`;
    case `literal`:
      return `${field} is ${issue.received}, where ${issue.expected ?? `another value`} is required.`;
    case `variant`:
      return `${field} is ${issue.received}, which is not one of the types allowed here.`;
    case `custom`:
      return last === `flags`
        ? `${field} is ${issue.received}, which includes a bit that is not a message flag Discord defines.`
        : typeof last === `string` && /id$/i.test(last)
          ? `${field} is ${issue.received}, which is not a Discord snowflake id (a numeric string).`
          : `${field} is ${issue.received}, which is not a valid value here.`;
    default:
      return issue.received === `undefined`
        ? `${field} is missing, and is required here.`
        : `${field} should be ${issue.expected ?? `something else`}, but is ${issue.received}.`;
  }
};

/** What the payload being validated is: a message's body, or a modal's. */
export type Body = `message` | `modal`;

const whys: Record<Body, string> = {
  message: `@discordkit/client's schema for a message body rejects it, so Discord would refuse to send the message.`,
  modal: `@discordkit/client's schema for a modal rejects it, so Discord would refuse to open the modal.`
};

const places: Record<Body, string> = {
  message: `such as a message's top level or a container`,
  modal: `such as a modal's top level or a Label`
};

const nextStep = (issue: Issue): string =>
  issue.received === `undefined`
    ? `Add the field, or check its spelling against Discord's component reference.`
    : `Change the value to one the field accepts.`;

const dedupe = (findings: Finding[]): Finding[] => {
  const seen = new Set<string>();
  return findings.filter((finding) => {
    const key = `${JSON.stringify(finding.path)}|${finding.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const isComponentObject = (value: unknown): value is { type: number } =>
  isObject(value) && typeof value.type === `number`;

/**
 * Turns valibot issues from validating part of a payload into findings, with paths through `translate` so they point into the caller's input.
 *
 * A union in @discordkit/client's schemas (a message's components, a container's children, an action row's children) reports every branch's issues mixed together when nothing matches, which mostly describes branches the caller never meant. So a failed union is validated again by the component's own `type`, through the client's discriminated `componentSchema`, which reports only what is wrong with that component. A component that passes on its own but failed the union is a valid component in a place that does not allow it.
 */
export const issueFindings = (
  issues: readonly Issue[],
  prefix: readonly PathSegment[],
  translate: Translate,
  code: IntakeCode = `schema`,
  body: Body = `message`
): Finding[] => {
  const findings: Finding[] = [];
  const why = whys[body];
  const leaf = (issue: Issue, at: Path): void => {
    const path = translate(at);
    const field = fieldName(path);
    findings.push({
      code,
      severity: `error`,
      path,
      // A check written in this package carries its own complete message.
      message:
        issue.type === `check` || issue.type === `raw_check`
          ? `${field} is ${issue.received}. ${issue.message}`
          : `${whatHappened(issue, field, at.at(-1))} ${code === `schema` ? why : `The scene cannot be drawn as written.`} ${nextStep(issue)}`
    });
  };
  const byComponentType = (input: { type: number }, at: Path): void => {
    const result = v.safeParse(componentSchema, input);
    if (result.success) {
      const path = translate(at);
      findings.push({
        code: `schema-position`,
        severity: `error`,
        path,
        message: `A ${componentName(input.type)} component is not allowed at ${path.length === 0 ? `the top of the input` : `this position`}. ${why} Move it to a place Discord's component reference allows it, ${places[body]}, or use a component that belongs here.`
      });
    } else {
      walk(result.issues, at);
    }
  };
  const walk = (list: readonly Issue[], base: Path): void => {
    for (const issue of list) {
      const at = [...base, ...issuePath(issue)];
      if (issue.issues === undefined) {
        leaf(issue, at);
      } else if (isComponentObject(issue.input)) {
        byComponentType(issue.input, at);
      } else if (
        Array.isArray(issue.input) &&
        issue.input.some(isComponentObject)
      ) {
        const before = findings.length;
        issue.input.forEach((item: unknown, index) => {
          if (isComponentObject(item)) {
            const result = v.safeParse(componentSchema, item);
            if (!result.success) walk(result.issues, [...at, index]);
          }
        });
        if (findings.length === before) {
          const path = translate(at);
          findings.push({
            code: `schema-position`,
            severity: `error`,
            path,
            message: `Each component in ${fieldName(path)} is valid on its own, but not in this combination here (${issue.input.map((item: unknown) => (isComponentObject(item) ? componentName(item.type) : typeof item)).join(`, `)}). ${why} Check which components this position allows and how many: an action row takes up to five buttons or one select menu, and a message without the Components V2 flag takes only action rows.`
          });
        }
      } else {
        // A union's sub-issues carry paths relative to the union's own input.
        walk(issue.issues, at);
      }
    }
  };
  walk(issues, [...prefix]);
  return dedupe(findings);
};
