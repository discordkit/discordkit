import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vite-plus/test";

/**
 * The command line is what a coding agent calls in its loop: change a message, run one command, read JSON, look at an image. So these specs run the built `discordkit-preview` as a child process, exactly as an agent would, and hold it to what an agent relies on: exactly one JSON document on standard output with `--json`, an exit status that separates "fine", "the message has errors" and "could not run", and messages that say what to do next.
 *
 * The program runs from the package's dist; run `vp run build` first. Renders are offline against an empty cache, and the inputs reference no remote images, so nothing reaches the network.
 */
const packageRoot = new URL(`../../../`, import.meta.url);
const bin = fileURLToPath(new URL(`bin/discordkit-preview.mjs`, packageRoot));
const built = new URL(`dist/cli.mjs`, packageRoot);
const fixture = fileURLToPath(
  new URL(`src/__tests__/wire/inbou-question.json`, packageRoot)
);
const asset = (name: string): string =>
  fileURLToPath(new URL(`src/__tests__/assets/${name}`, packageRoot));

// Every `render` here launches a browser in a child process, which on a cold two-core CI runner has taken longer than Vitest's default limits.
const renderTimeout = 60_000;

// Every test in this file starts the command as its own process, and several of those draw through a real browser. On a slow CI runner tests like these have run past Vitest's default 5 second limit, so the whole file gets a limit with room in it.
vi.setConfig({ testTimeout: 60_000 });

/** CI drives the Chrome its runner image ships, as the other browser specs do. */
const channel = process.env.CI ? [`--channel`, `chrome`] : [];

interface Run {
  code: number | null;
  stdout: string;
  stderr: string;
}

const run = async (
  args: readonly string[],
  stdin?: string,
  script = bin
): Promise<Run> =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      stdio: [`pipe`, `pipe`, `pipe`]
    });
    let stdout = ``;
    let stderr = ``;
    child.stdout
      .setEncoding(`utf8`)
      .on(`data`, (chunk: string) => (stdout += chunk));
    child.stderr
      .setEncoding(`utf8`)
      .on(`data`, (chunk: string) => (stderr += chunk));
    child.on(`error`, reject);
    child.on(`close`, (code) => resolve({ code, stdout, stderr }));
    child.stdin.end(stdin ?? ``);
  });

/** Standard output as the one JSON document `--json` promises: fails if there is anything else there. */
const json = ({ stdout }: Run): unknown => JSON.parse(stdout);

const pngSignature = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
]);

/** A text input, which only a modal holds and the renderer does not draw yet. */
const unsupported = JSON.stringify({
  flags: 32768,
  components: [
    {
      type: 1,
      components: [{ type: 4, custom_id: `name`, style: 1, label: `Name` }]
    }
  ]
});

describe(`discordkit-preview`, () => {
  let out: string;

  beforeAll(() => {
    if (!existsSync(built)) {
      throw new Error(
        `The built command is missing at ${fileURLToPath(built)}. This spec runs the program the package ships, from its dist. Run \`vp run build\` (or \`vp pack\` in packages/preview), then run the tests again.`
      );
    }
  });

  beforeEach(async () => {
    out = await mkdtemp(join(tmpdir(), `discordkit-preview-cli-`));
    return async () => rm(out, { recursive: true, force: true });
  });

  const offline = (): string[] => [
    `--offline`,
    `--cache-dir`,
    join(out, `cache`),
    ...channel
  ];

  describe(`help`, () => {
    it(`lists every command and what each exit status means`, async () => {
      const result = await run([`--help`]);
      expect(result.code).toBe(0);
      for (const command of [`render`, `lint`, `codegen`, `diff`, `studio`])
        expect(result.stdout).toContain(command);
      expect(result.stdout).toMatch(/Exit status:\s+0[\s\S]+1[\s\S]+2/);
    });

    it.each([`render`, `lint`, `codegen`, `diff`, `studio`])(
      `explains %s's options`,
      async (command) => {
        const result = await run([command, `--help`]);
        expect(result.code).toBe(0);
        expect(result.stdout).toMatch(
          new RegExp(`^Usage: discordkit-preview ${command}`)
        );
        expect(result.stdout).toContain(`--json`);
      }
    );
  });

  describe(`lint`, () => {
    it(`prints one JSON document with each input's findings and counts, and exits 0 for a valid message`, async () => {
      const result = await run([`lint`, fixture, `--json`]);
      expect(result.code).toBe(0);
      expect(result.stderr).toBe(``);
      expect(json(result)).toMatchObject({
        results: [
          {
            input: fixture,
            kind: `message`,
            valid: true,
            findings: [],
            counts: expect.arrayContaining([
              expect.objectContaining({
                metric: `components`,
                used: 13,
                limit: 40
              })
            ])
          }
        ]
      });
    });

    it(`reads standard input, and exits 1 when the message has errors`, async () => {
      const result = await run([`lint`, `--json`], `{"content": 7}`);
      expect(result.code).toBe(1);
      expect(json(result)).toMatchObject({
        results: [
          {
            input: `<stdin>`,
            valid: false,
            findings: expect.arrayContaining([
              expect.objectContaining({
                code: `schema`,
                severity: `error`,
                path: [`content`]
              })
            ])
          }
        ]
      });
    });
  });

  describe(`codegen`, () => {
    it(`prints TypeScript typed with @discordkit/client`, async () => {
      const result = await run([`codegen`, fixture]);
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/^import \{/);
      expect(result.stdout).toContain(
        `export const message: MessagesCallbackData = {`
      );
      expect(result.stdout).toContain(`flags: MessageFlag.IS_COMPONENTS_V2`);
    });

    it(`puts the source and findings in one JSON document with --json`, async () => {
      const result = await run(
        [`codegen`, `--json`, `--shape`, `components`, `--name`, `question`],
        await readFile(fixture, `utf8`)
      );
      expect(result.code).toBe(0);
      expect(json(result)).toMatchObject({
        input: `<stdin>`,
        kind: `message`,
        valid: true,
        source: expect.stringContaining(
          `export const question: MessageComponent = [`
        ),
        findings: []
      });
    });
  });

  describe(`render`, () => {
    it(
      `writes a PNG at the requested scale and reports it as one JSON document`,
      async () => {
        const output = join(out, `question.png`);
        const result = await run([
          `render`,
          fixture,
          `--out`,
          output,
          `--scale`,
          `2`,
          `--json`,
          ...offline()
        ]);
        expect(result.code).toBe(0);
        expect(json(result)).toMatchObject({
          results: [
            {
              input: fixture,
              kind: `message`,
              valid: true,
              output,
              format: `png`,
              width: 1200,
              findings: []
            }
          ]
        });
        const png = await readFile(output);
        expect(png.subarray(0, 8)).toStrictEqual(pngSignature);
        expect(png.readUInt32BE(16)).toBe(1200);
      },
      renderTimeout
    );

    it(
      `draws several inputs in one call, from files and standard input alike, to the same bytes for the same message`,
      async () => {
        const result = await run(
          [`render`, fixture, `-`, `--out-dir`, out, `--json`, ...offline()],
          await readFile(fixture, `utf8`)
        );
        expect(result.code).toBe(0);
        const { results } = json(result) as {
          results: { input: string; output: string }[];
        };
        expect(
          results.map(({ input, output }) => ({ input, output }))
        ).toStrictEqual([
          { input: fixture, output: join(out, `inbou-question.png`) },
          { input: `<stdin>`, output: join(out, `preview.png`) }
        ]);
        const [fromFile, fromStdin] = await Promise.all(
          results.map(async ({ output }) => readFile(output))
        );
        expect(Buffer.compare(fromFile, fromStdin)).toBe(0);
      },
      renderTimeout
    );

    it(`reports a component it cannot draw as a finding with the next step, exits 1, and prints no stack trace`, async () => {
      const result = await run(
        [`render`, `--out`, join(out, `x.png`), `--json`, ...offline()],
        unsupported
      );
      expect(result.code).toBe(1);
      expect(json(result)).toMatchObject({
        results: [
          {
            output: null,
            valid: false,
            findings: expect.arrayContaining([
              expect.objectContaining({
                code: `component-unsupported`,
                severity: `error`,
                message: expect.stringMatching(/Remove it to preview the rest/)
              })
            ])
          }
        ]
      });
      expect(result.stderr).not.toMatch(/\n\s+at /);
      expect(existsSync(join(out, `x.png`))).toBe(false);
    });

    it(
      `writes one HTML file with no scripts and nothing to fetch, with --html`,
      async () => {
        const output = join(out, `question.html`);
        const result = await run([
          `render`,
          fixture,
          `--html`,
          `--cjk`,
          `noto-sans-jp`,
          `--out`,
          output,
          ...offline()
        ]);
        expect(result.code).toBe(0);
        expect(result.stdout).toContain(`wrote ${output}`);
        const html = await readFile(output, `utf8`);
        expect(html).toMatch(/^<!doctype html>/);
        expect(html).not.toMatch(/<script|\.invalid/i);
      },
      renderTimeout
    );

    it(
      `explains a browser it cannot launch, naming the next step, and exits 2`,
      async () => {
        const result = await run([
          `render`,
          fixture,
          `--out`,
          join(out, `x.png`),
          `--json`,
          `--channel`,
          `no-such-browser`
        ]);
        expect(result.code).toBe(2);
        expect(json(result)).toStrictEqual({
          error: {
            message: expect.stringMatching(
              /could not launch the browser for `--channel no-such-browser`/
            )
          }
        });
      },
      renderTimeout
    );

    it(`refuses --out with several inputs before drawing anything, since they would overwrite one file`, async () => {
      const result = await run([
        `render`,
        fixture,
        fixture,
        `--out`,
        join(out, `x.png`)
      ]);
      expect(result.code).toBe(2);
      expect(result.stderr).toMatch(/Use --out-dir <dir>/);
    });
  });

  describe(`diff`, () => {
    it(`exits 0 for two images with the same pixels`, async () => {
      const result = await run([
        `diff`,
        asset(`square-128.png`),
        asset(`square-128.png`),
        `--out`,
        join(out, `d.png`),
        `--json`
      ]);
      expect(result.code).toBe(0);
      expect(json(result)).toMatchObject({
        identical: true,
        differentPixels: 0,
        box: null,
        tolerance: 0
      });
    });

    it(`exits 1 for images that differ, saying how much and where, and writes the diff image`, async () => {
      const output = join(out, `d.png`);
      const result = await run([
        `diff`,
        asset(`square-128.png`),
        asset(`square-128-b.png`),
        `--out`,
        output,
        `--json`
      ]);
      expect(result.code).toBe(1);
      expect(json(result)).toMatchObject({
        a: { width: 128, height: 128 },
        b: { width: 128, height: 128 },
        identical: false,
        sameSize: true,
        differentPixels: expect.any(Number),
        totalPixels: 16384,
        box: expect.objectContaining({ x: expect.any(Number) }),
        output
      });
      expect((await readFile(output)).subarray(0, 8)).toStrictEqual(
        pngSignature
      );
    });

    it(`exits 2 for a file that is not a PNG, saying which`, async () => {
      const result = await run([
        `diff`,
        asset(`square-128.png`),
        fixture,
        `--out`,
        join(out, `d.png`),
        `--json`
      ]);
      expect(result.code).toBe(2);
      expect(json(result)).toStrictEqual({
        error: {
          message: expect.stringMatching(
            /could not read the second image as a PNG/
          )
        }
      });
    });
  });

  describe(`studio`, () => {
    it(`refuses a file that does not exist rather than creating one, and says what to do`, async () => {
      const result = await run([
        `studio`,
        join(out, `missing.json`),
        `--json`,
        `--no-open`,
        `--port`,
        `0`
      ]);
      expect(result.code).toBe(2);
      const { error } = json(result) as { error: { message: string } };
      expect(error.message).toMatch(/no file there/);
      expect(error.message).toMatch(/create the file first/);
    });

    it(`cannot edit standard input, since it writes back to the file it reads`, async () => {
      const result = await run([`studio`, `-`, `--no-open`]);
      expect(result.code).toBe(2);
      expect(result.stderr).toMatch(/cannot edit standard input/);
    });
  });

  describe(`failures to run`, () => {
    it(`prints a JSON error for an unknown option with --json, and exits 2`, async () => {
      const result = await run([`lint`, fixture, `--json`, `--bogus`]);
      expect(result.code).toBe(2);
      expect(json(result)).toStrictEqual({
        error: {
          message: expect.stringMatching(
            /Unknown option '--bogus'\. Run `discordkit-preview lint --help`/
          )
        }
      });
    });

    it(`names a file it cannot read and where relative paths start`, async () => {
      const result = await run([`lint`, join(out, `nope.json`)]);
      expect(result.code).toBe(2);
      expect(result.stderr).toMatch(/could not read .*nope\.json/);
      expect(result.stderr).toMatch(/resolved against the working directory/);
    });

    it(`says to build the package when the command runs before it has been built`, async () => {
      const unbuilt = join(out, `bin`);
      await mkdir(unbuilt);
      await copyFile(bin, join(unbuilt, `discordkit-preview.mjs`));
      const result = await run(
        [`--help`],
        undefined,
        join(unbuilt, `discordkit-preview.mjs`)
      );
      expect(result.code).toBe(2);
      expect(result.stderr).toMatch(/has not been built/);
      expect(result.stderr).toMatch(/vp run build/);
    });
  });
});
