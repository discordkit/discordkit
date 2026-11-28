import { runInThisContext } from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vite-plus/test";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { TextInputStyle } from "@discordkit/client/components/types/TextInputStyle";
import { EmbedType } from "@discordkit/client/messages/types/EmbedType";
import { MessageFlag } from "@discordkit/client/messages/types/MessageFlag";
import { toSnakeKeys } from "@discordkit/core/utils/toSnakeKeys";
import {
  buttonSheet,
  embedSheet,
  fileSheet,
  fixtures,
  gallerySheet,
  inbouLevelPicker,
  inbouSettings,
  inbouStudyPack,
  openMultiSelectSheet,
  openSelectSheet,
  sectionSheet,
  selectSheet,
  spoilerSheet,
  thumbnailSheet,
  tomeHeroCard,
  tomeSpoilerAnswer
} from "../../__tests__/fixtures.js";
import {
  checkboxGroupSheet,
  checkboxSheet,
  fileUploadSheet,
  modalOpening,
  modalScenes,
  paragraphTextInputSheet,
  radioGroupSheet
} from "../../__tests__/modalFixtures.js";
import inbouQuestionWire from "../../__tests__/wire/inbou-question.json" with { type: "json" };
import { codegen, templateLiteral } from "../index.js";

const scenes = {
  ...fixtures,
  buttonSheet,
  embedSheet,
  gallerySheet,
  tomeHeroCard,
  tomeSpoilerAnswer,
  sectionSheet,
  thumbnailSheet
};

/** Scenes with select rows or File components, which @discordkit/client's schema and types reject until #106. */
const awaitingClientFix = {
  inbouStudyPack,
  inbouSettings,
  inbouLevelPicker,
  fileSheet,
  selectSheet,
  openSelectSheet,
  openMultiSelectSheet,
  spoilerSheet
};

/**
 * What generated code reads from `@discordkit/client` at run time: only the enums it names, since its types are erased. Importing them one by one keeps the client's whole source out of the test run, which otherwise slows every other spec running beside this one.
 */
const client = {
  ButtonStyle,
  ComponentType,
  EmbedType,
  MessageFlag,
  TextInputStyle
};

/** Where the generated files pretend to live, so module resolution and the package's tsconfig apply to them as to any source file here. */
const sourceDir = fileURLToPath(new URL(`../../`, import.meta.url)).replaceAll(
  `\\`,
  `/`
);
const packageDir = fileURLToPath(new URL(`../../../`, import.meta.url));

const loadConfig = (): ts.ParsedCommandLine => {
  const config = ts.getParsedCommandLineOfConfigFile(
    `${packageDir}/tsconfig.json`,
    undefined,
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(
          ts.flattenDiagnosticMessageText(diagnostic.messageText, `\n`)
        );
      }
    }
  );
  if (config === undefined) throw new Error(`No tsconfig for ${packageDir}`);
  return config;
};

/**
 * Type-checks generated files against @discordkit/client with the package's own compiler options, the way `vp check` would if the files were in the repo, and returns each error as text. One program for all files, since loading the client's types is most of the cost.
 */
const typecheck = (files: Record<string, string>): string[] => {
  const { options } = loadConfig();
  const virtual = new Map(
    Object.entries(files).map(([name, text]) => [
      `${sourceDir}__generated__/${name}.ts`,
      text
    ])
  );
  const normal = (name: string): string => name.replaceAll(`\\`, `/`);
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (name, version, ...rest) => {
    const text = virtual.get(normal(name));
    return text === undefined
      ? getSourceFile(name, version, ...rest)
      : ts.createSourceFile(name, text, version);
  };
  const fileExists = host.fileExists.bind(host);
  host.fileExists = (name) => virtual.has(normal(name)) || fileExists(name);
  const readFile = host.readFile.bind(host);
  host.readFile = (name) => virtual.get(normal(name)) ?? readFile(name);
  const program = ts.createProgram(
    [...virtual.keys()],
    { ...options, noEmit: true },
    host
  );
  return [...virtual.keys()].flatMap((name) =>
    ts
      .getPreEmitDiagnostics(program, program.getSourceFile(name))
      .map(
        (diagnostic) =>
          `${diagnostic.file?.fileName ?? ``}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, `\n`)}`
      )
  );
};

/** Runs generated source with `@discordkit/client` as its only import and returns its exports. */
const evaluate = (source: string): Record<string, unknown> => {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    }
  });
  const exports: Record<string, unknown> = {};
  const run: unknown = runInThisContext(
    `(function (exports, require) {${outputText}\n})`
  );
  if (typeof run !== `function`) throw new Error(`Not a function`);
  run(exports, (id: string) => {
    if (id !== `@discordkit/client`) throw new Error(`Unexpected import ${id}`);
    return client;
  });
  return exports;
};

const generate = (input: unknown, shape?: `components`): string => {
  const { source, findings } = codegen(input, shape ? { shape } : {});
  expect(findings).toStrictEqual([]);
  if (source === undefined) throw new Error(`No source generated`);
  return source;
};

describe(`codegen output compiles and round-trips`, () => {
  const sources = Object.fromEntries(
    Object.entries(scenes).flatMap(([name, scene]) => [
      [`${name}Message`, generate(scene)],
      [`${name}Components`, generate(scene, `components`)]
    ])
  );

  it(`type-checks against @discordkit/client for every fixture, as a message body and as components`, () => {
    // Text that looks right but does not compile is worse than no generator: the agent pastes it and the bot's build fails.
    expect(typecheck(sources)).toStrictEqual([]);
  }, 120_000);

  it(`would report a type error, so the check above is not vacuous`, () => {
    const broken = generate(fixtures.tomeQuestion).replace(
      `style: ButtonStyle.Secondary`,
      `style: 9`
    );
    expect(typecheck({ broken })).not.toStrictEqual([]);
  }, 120_000);

  it.each(Object.entries(scenes))(
    `evaluates %s back to the payloads it was generated from`,
    (_, scene) => {
      const messages = evaluate(generate(scene));
      const components = evaluate(generate(scene, `components`));
      scene.messages.forEach((message, index) => {
        const suffix = scene.messages.length === 1 ? `` : String(index + 1);
        expect(messages[`message${suffix}`]).toStrictEqual(message.payload);
        expect(components[`components${suffix}`]).toStrictEqual(
          message.payload.components ?? []
        );
      });
    }
  );

  /** These hold select rows and File components written the way Discord expects, which @discordkit/client's schema and types still reject (#106): intake reports `schema` findings for them and their source would not type-check yet. Until #106 lands they are only round-tripped; then they belong in `scenes` above. */
  it.each(Object.entries(awaitingClientFix))(
    `evaluates %s back to the payloads it was generated from, though the client's types reject its selects and files until #106`,
    (_, scene) => {
      const { source } = codegen(scene);
      if (source === undefined) throw new Error(`No source generated`);
      const messages = evaluate(source);
      scene.messages.forEach((message, index) => {
        const suffix = scene.messages.length === 1 ? `` : String(index + 1);
        expect(messages[`message${suffix}`]).toStrictEqual(message.payload);
      });
    }
  );
});

describe(`codegen output for modals compiles and round-trips`, () => {
  /** Modals whose every field @discordkit/client's types describe as Discord does. */
  const typed = {
    radioGroupSheet,
    checkboxGroupSheet,
    checkboxSheet,
    fileUploadSheet
  };
  /** Modals with a Text Input in a Label (the client's `TextInput` requires the deprecated `label`), a select's modal-only `required` (absent from the client's select types) or the older Action Row of a Text Input in an array (the client's `ActionRow` takes it bare). Correct for Discord, so they are round-tripped; their source does not type-check until the client's types are fixed, and then they belong in `typed`. */
  const awaitingClientTypes = Object.fromEntries(
    Object.entries(modalScenes).filter(([name]) => !(name in typed))
  );

  it(`type-checks every modal whose fields the client's types describe, as ModalCallbackData`, () => {
    const sources = Object.fromEntries(
      Object.entries(typed).map(([name, scene]) => [
        name,
        generate(scene.modal?.payload)
      ])
    );
    expect(Object.values(sources)[0]).toContain(
      `export const modal: ModalCallbackData = {`
    );
    expect(typecheck(sources)).toStrictEqual([]);
  }, 120_000);

  it.each(Object.entries(modalScenes))(
    `evaluates %s back to the modal it was generated from`,
    (_, scene) => {
      const { source } = codegen(scene.modal?.payload);
      if (source === undefined) throw new Error(`No source generated`);
      expect(evaluate(source).modal).toStrictEqual(scene.modal?.payload);
    }
  );

  it(`writes a scene's modal after its messages, so the message and the modal it opens come out together`, () => {
    const { source } = codegen(modalOpening);
    if (source === undefined) throw new Error(`No source generated`);
    expect(source).toMatch(
      /import \{[^}]*type MessagesCallbackData,[^}]*type ModalCallbackData[^}]*\} from "@discordkit\/client";/s
    );
    const exports = evaluate(source);
    expect(exports.message).toStrictEqual(modalOpening.messages[0]?.payload);
    expect(exports.modal).toStrictEqual(modalOpening.modal?.payload);
    expect(Object.keys(awaitingClientTypes)).toContain(`modalOpening`);
  });

  it(`writes the components a Label wraps with enum members, as it does a message's`, () => {
    const { source } = codegen(paragraphTextInputSheet.modal?.payload);
    expect(source).toContain(`type: ComponentType.Label,`);
    expect(source).toContain(`type: ComponentType.TextInput,`);
    expect(source).toContain(`style: TextInputStyle.Paragraph,`);
  });
});

describe(`codegen style`, () => {
  it(`writes the example in the design record: enum members, a hex colour, backtick strings and the client's types`, () => {
    expect(
      generate([
        {
          type: 17,
          accent_color: 0x58_65_f2,
          components: [{ type: 10, content: `## Which hero is this?` }]
        }
      ])
    ).toBe(
      [
        `import { ComponentType, type MessageComponent } from "@discordkit/client";`,
        ``,
        `export const components: MessageComponent = [`,
        `  {`,
        `    type: ComponentType.Container,`,
        `    accentColor: 0x5865f2,`,
        `    components: [`,
        `      { type: ComponentType.TextDisplay, content: \`## Which hero is this?\` }`,
        `    ]`,
        `  }`,
        `];`,
        ``
      ].join(`\n`)
    );
  });

  it(`writes the same text for the same payload whatever its key spelling`, () => {
    const camel = generate(fixtures.inbouQuestion.messages[0]?.payload);
    expect(generate(inbouQuestionWire)).toBe(camel);
    expect(
      generate(toSnakeKeys(fixtures.inbouQuestion.messages[0]?.payload ?? {}))
    ).toBe(camel);
  });

  it(`writes several flags as MessageFlag members joined with |`, () => {
    expect(
      generate({ flags: 32768 | 64, components: [{ type: 10, content: `x` }] })
    ).toContain(`flags: MessageFlag.EPHEMERAL | MessageFlag.IS_COMPONENTS_V2,`);
  });
});

describe(`templateLiteral`, () => {
  const awkward = [
    `plain`,
    `a \`backtick\` and \${notInterpolated} and $alone and $\{split`,
    `back\\slash, \\n not a newline, and \\\` an escaped backtick`,
    `line one\nline two\r\n\ttabbed`,
    `🔥 emoji, 👩‍👩‍👧 a joined family, 兄は 先生です`,
    `separators   and  , a NUL \u0000 and a lone surrogate \ud800 here`,
    `ends with a backslash \\`,
    ``
  ];

  it.each(awkward)(`round-trips %j through a template literal`, (text) => {
    const { value } = evaluate(
      `export const value = ${templateLiteral(text)};`
    );
    expect(value).toBe(text);
  });

  it(`keeps any string safe inside generated source that still compiles`, () => {
    const source = generate([
      { type: 10, content: awkward.join(`\n`) },
      { type: 10, content: `\`\${process.exit(1)}\`` }
    ]);
    expect(typecheck({ awkward: source })).toStrictEqual([]);
    expect(evaluate(source).components).toStrictEqual([
      { type: 10, content: awkward.join(`\n`) },
      { type: 10, content: `\`\${process.exit(1)}\`` }
    ]);
  }, 120_000);
});
