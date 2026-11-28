import { describe, it, expect } from "vite-plus/test";
import { lint } from "@discordkit/preview/lint";
import { parts, sceneParts, type PartId } from "@discordkit/preview/scene";
import { cases } from "../../../packages/preview/src/markdown/__tests__/cases.ts";
import { attachableFile } from "../assets.ts";
import {
  assumedCases,
  captureSet,
  caseCode,
  fixtureScene,
  fixtureScreenshots,
  labelText,
  longLabel,
  manualSteps,
  notCovered,
  parseTier,
  selectFixtures,
  totalScreenshots
} from "../captureSet.ts";
import { attachmentNames } from "../wire.ts";

/**
 * The capture set exists to close the gaps listed in spec §7b, with payloads Discord will take. These specs check the set against those two purposes: what it covers, and that every fixture would post.
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === `object` && value !== null && !Array.isArray(value);

/** Every object in a payload, however deep. */
const objects = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) return value.flatMap(objects);
  if (!isRecord(value)) return [];
  return [value, ...Object.values(value).flatMap(objects)];
};

const payloads = (): { code: string; payload: unknown }[] =>
  captureSet.flatMap((fixture) =>
    fixture.messages.flatMap((message) => [
      { code: fixture.code, payload: message.payload },
      ...(message.before
        ? [{ code: fixture.code, payload: message.before }]
        : [])
    ])
  );

describe(`the capture set`, () => {
  it(`posts every markdown case the parser only assumes, each exactly once, so calibration can check all of them`, () => {
    const assumed = cases.filter((entry) => entry.provenance === `assumed`);
    expect(assumedCases).toEqual(assumed);

    const posted = JSON.stringify(
      captureSet.map((fixture) => fixture.messages)
    );
    // Each case's label appears once, so a screenshot shows which case is which.
    const counts = assumed.map((_, index) => ({
      label: caseCode(index),
      count: posted.split(caseCode(index)).length - 1
    }));
    expect(counts.filter(({ count }) => count !== 1)).toEqual([]);
  });

  it(`puts each embed case in the part of an embed its context names, since parsing differs by part`, () => {
    const embedCases = assumedCases
      .map((entry, index) => ({ entry, label: caseCode(index) }))
      .filter(({ entry }) => entry.context.startsWith(`embed`));
    const embeds = captureSet
      .flatMap((fixture) => fixture.messages)
      .flatMap((message) => message.payload.embeds ?? []);
    for (const { entry, label } of embedCases) {
      const embed = embeds.find((candidate) =>
        JSON.stringify(candidate).includes(label)
      );
      const placed = {
        embedTitle: embed?.title,
        embedDescription: embed?.description,
        embedFieldValue: embed?.fields?.[0]?.value,
        embedFieldName: embed?.fields?.[0]?.name,
        embedAuthor: embed?.author?.name,
        embedFooter: embed?.footer?.text
      }[entry.context as `embedTitle`];
      expect({ label, placed }).toEqual({ label, placed: entry.source });
    }
  });

  it(`shows every part the iOS app has never been seen drawing, except those only the person can produce and those it says it leaves out`, () => {
    // Posting cannot make these: each is a step for the person.
    const manual = new Set<PartId>([
      `ephemeral`,
      `lightTheme`,
      `ashTheme`,
      `onyxTheme`,
      // A modal is a bot's answer to an interaction, which posting cannot make.
      `modal`,
      `modalLabel`,
      `shortTextInput`,
      `paragraphTextInput`,
      `modalSelect`,
      `fileUpload`,
      `radioGroup`,
      `checkboxGroup`,
      `checkbox`,
      `modalError`
    ]);
    const steps = manualSteps.map((step) => step.title).join(` `);
    expect(steps).toMatch(/ephemeral/i);
    expect(steps).toMatch(/themes/i);
    expect(steps).toMatch(/modal/i);
    // And these the kit names as not covered, with the reason.
    const declared = new Set(
      notCovered.flatMap(({ part }) => (part ? [part] : []))
    );

    const unobserved = (Object.keys(parts) as PartId[]).filter(
      (part) => parts[part].ios === null
    );
    const shown = new Set(
      captureSet.flatMap((fixture) => sceneParts(fixtureScene(fixture)).parts)
    );
    expect(
      unobserved.filter(
        (part) => !shown.has(part) && !manual.has(part) && !declared.has(part)
      )
    ).toEqual([]);
    // Nothing is declared missing that is in fact posted.
    expect([...declared].filter((part) => shown.has(part))).toEqual([]);
  });

  it(`has galleries of every count from 1 to 10 in large squares and in small wide pictures`, () => {
    for (const stem of [`large-square`, `small-wide`]) {
      for (let count = 1; count <= 10; count += 1) {
        const expected = Array.from(
          { length: count },
          (_, index) => `${stem}-${String(index + 1)}.png`
        );
        const found = payloads().some(({ payload }) =>
          objects(payload).some(
            (item) =>
              Array.isArray(item.items) &&
              JSON.stringify(attachmentNames(item.items)) ===
                JSON.stringify(expected)
          )
        );
        expect({ stem, count, found }).toEqual({ stem, count, found: true });
      }
    }
  });

  it(`has every button style Discord lets a bot post without a store, disabled, with emoji, at the longest label, and five in a row`, () => {
    const buttons = payloads().flatMap(({ payload }) =>
      objects(payload).filter((item) => item.type === 2)
    );
    expect(new Set(buttons.map((button) => button.style))).toEqual(
      new Set([1, 2, 3, 4, 5])
    );
    expect(buttons.some((button) => button.disabled === true)).toBe(true);
    expect(buttons.some((button) => isRecord(button.emoji))).toBe(true);
    expect(longLabel).toHaveLength(80);
    expect(buttons.some((button) => button.label === longLabel)).toBe(true);
    const rowOfFive = payloads().some(({ payload }) =>
      objects(payload).some(
        (item) =>
          item.type === 1 &&
          Array.isArray(item.components) &&
          item.components.length === 5
      )
    );
    expect(rowOfFive).toBe(true);
  });

  it(`numbers fixtures in posting order and labels each with its number, so a screenshot names its fixture`, () => {
    captureSet.forEach((fixture, index) => {
      expect(fixture.number).toBe(index + 1);
      expect(fixture.code).toBe(`F${String(index + 1).padStart(2, `0`)}`);
      expect(labelText(fixture).startsWith(`${fixture.code} · `)).toBe(true);
    });
    // The label comes from another author, so the fixture's own first message keeps its header.
    const scene = fixtureScene(captureSet[0]);
    expect(scene.messages[0].author).not.toBe(scene.messages[1].author);
  });

  it(`counts each fixture's screenshots per platform it asks for, two for a tall one and twice that with a follow-up`, () => {
    for (const fixture of captureSet) {
      for (const platform of [`desktop`, `ios`] as const) {
        const one = fixture.tall?.includes(platform) ? 2 : 1;
        const expected = fixture.platforms.includes(platform)
          ? fixture.followUp
            ? one * 2
            : one
          : 0;
        expect(fixtureScreenshots(fixture, platform)).toBe(expected);
      }
    }
  });

  it(`picks fixtures by number whatever their tier, and otherwise by tier, the essential one by default`, () => {
    expect(selectFixtures(`2,4-5`).map((fixture) => fixture.number)).toEqual([
      2, 4, 5
    ]);
    expect(selectFixtures(undefined)).toEqual(
      captureSet.filter((fixture) => fixture.tier === `essential`)
    );
    expect(selectFixtures(undefined, `all`)).toHaveLength(captureSet.length);
    expect(() => selectFixtures(`0`)).toThrow(/fixtures 1 to/);
    expect(() => selectFixtures(`two`)).toThrow(/is not a fixture number/);
    expect(parseTier(undefined)).toBe(`essential`);
    expect(() => parseTier(`everything`)).toThrow(
      /essential, extended, markdown/
    );
  });
});

/**
 * The owner does this by hand, once, so the first tier has to fit one sitting and still cover what their bots send. These pin both.
 */
describe(`the essential tier`, () => {
  const essential = captureSet.filter(
    (fixture) => fixture.tier === `essential`
  );

  it(`needs no more than 15 screenshots on each platform, manual steps included`, () => {
    expect(totalScreenshots(`desktop`, `essential`)).toBeLessThanOrEqual(15);
    expect(totalScreenshots(`ios`, `essential`)).toBeLessThanOrEqual(15);
  });

  it(`comes first, so its fixtures are numbered from F01 whichever tiers are posted`, () => {
    expect(essential.map((fixture) => fixture.number)).toEqual(
      essential.map((_, index) => index + 1)
    );
  });

  it(`shows every part of what Inbou and Tome send`, () => {
    const sent: PartId[] = [
      `header`,
      `groupedMessage`,
      `edited`,
      `container`,
      `accent`,
      `text`,
      `bold`,
      `italic`,
      `underline`,
      `heading2`,
      `heading3`,
      `subtext`,
      `blockQuote`,
      `inlineCode`,
      `link`,
      `mention`,
      `emoji`,
      `relativeTimestamp`,
      `timestamp`,
      `separator`,
      `gallery`,
      `secondaryButton`,
      `primaryButton`,
      `dangerButton`,
      `disabledButton`,
      `buttonEmoji`,
      `embed`,
      `topLevel`
    ];
    const shown = new Set(
      essential.flatMap((fixture) => sceneParts(fixtureScene(fixture)).parts)
    );
    expect(sent.filter((part) => !shown.has(part))).toEqual([]);
  });

  it(`has galleries of one, two and three pictures; four, already observed on both clients, waits in the extended tier`, () => {
    const counts = new Set(
      essential.flatMap(({ messages }) =>
        messages.flatMap(({ payload }) =>
          objects(payload)
            .filter((item) => item.type === 12)
            .map((item) => (Array.isArray(item.items) ? item.items.length : 0))
        )
      )
    );
    expect([...counts].sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });
});

describe(`the markdown tier`, () => {
  it(`asks for desktop screenshots only, since parsing is the parser's and not the platform's`, () => {
    const markdown = captureSet.filter(
      (fixture) => fixture.tier === `markdown`
    );
    expect(markdown.length).toBeGreaterThan(0);
    for (const fixture of markdown)
      expect(fixture.platforms).toEqual([`desktop`]);
    expect(totalScreenshots(`ios`, `markdown`)).toBe(0);
  });
});

describe(`every fixture would be accepted by Discord`, () => {
  it(`names only files the kit can upload`, () => {
    for (const fixture of captureSet) {
      const scene = fixtureScene(fixture);
      for (const { payload } of fixture.messages) {
        for (const name of attachmentNames(payload)) {
          // Throws, naming the file, for one the kit does not have.
          expect(attachableFile(name, scene).bytes.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it(`invents no server emoji and no SKU, which Discord would refuse`, () => {
    const refused = payloads().flatMap(({ code, payload }) =>
      objects(payload).flatMap((item) => [
        ...(isRecord(item.emoji) && typeof item.emoji.id === `string`
          ? [`${code}: server emoji ${item.emoji.id}`]
          : []),
        ...(item.type === 2 && item.style === 6
          ? [`${code}: a Premium button`]
          : [])
      ])
    );
    expect(refused).toEqual([]);
  });

  it(`passes the preview's lint with no errors but the client schema's known false ones (#106)`, () => {
    const errors = captureSet.flatMap((fixture) =>
      lint(fixtureScene(fixture))
        .findings.filter(
          (finding) =>
            finding.severity === `error` &&
            // The client's schemas refuse a select in an action row and a File without `name` and `size`, both of which Discord takes; fixed in #106.
            finding.code !== `schema-position` &&
            !(
              finding.code === `schema` &&
              [`name`, `size`].includes(String(finding.path.at(-1)))
            )
        )
        .map((finding) => `${fixture.code}: ${finding.message}`)
    );
    expect(errors).toEqual([]);
  });
});
