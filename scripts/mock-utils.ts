import { http } from "msw";
import { type SetupServer, setupServer } from "msw/node";
import { Valimock, type ValimockOptions } from "valimock";
import { isOfType, isOfKind, getTitle } from "valibot";
import type {
  InferInput,
  TransformAction,
  TransformActionAsync,
  GenericPipeItem,
  GenericPipeItemAsync,
  GenericSchema,
  GenericSchemaAsync,
  InferOutput,
  SchemaWithPipe,
  SchemaWithPipeAsync,
  TitleAction
} from "valibot";
import { Snowflake } from "nodejs-snowflake";
import { faker } from "@faker-js/faker";

interface DiscordSession {
  endpoint: string;
  get ready(): boolean;
  setToken: (token: string) => void;
  clearSession: () => void;
  getSession: () => string;
}

type Optional<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>;

type MaybeReadonly<TValue> = TValue | Readonly<TValue>;

type Schema = GenericSchema | GenericSchemaAsync;

type SchemaMaybeWithTitle =
  | Schema
  | SchemaWithPipe<
      MaybeReadonly<
        [
          GenericSchema,
          ...Array<GenericPipeItem | TitleAction<unknown, string>>
        ]
      >
    >
  | SchemaWithPipeAsync<
      MaybeReadonly<
        [
          Schema,
          ...Array<
            | GenericPipeItem
            | GenericPipeItemAsync
            | TitleAction<unknown, string>
          >
        ]
      >
    >;

type GenericPipe = MaybeReadonly<
  [GenericSchema, ...Array<GenericPipeItem | TransformAction<unknown, unknown>>]
>;

type GenericPipeAsync = MaybeReadonly<
  [
    GenericSchema | GenericSchemaAsync,
    ...Array<
      | GenericPipeItem
      | GenericPipeItemAsync
      | TransformAction<unknown, unknown>
      | TransformActionAsync<unknown, unknown>
    >
  ]
>;

type GenericTransformationActon =
  | TransformAction<unknown, unknown>
  | TransformActionAsync<unknown, unknown>;

type GenericTransformation =
  | TransformAction<unknown, unknown>[`operation`]
  | TransformActionAsync<unknown, unknown>[`operation`];

type GenericSchemaWithPipe<TSchema extends Schema> =
  TSchema extends GenericSchema
    ? SchemaWithPipe<MaybeReadonly<[TSchema, ...GenericPipeItem[]]>>
    : SchemaWithPipeAsync<
        MaybeReadonly<
          [TSchema, ...Array<GenericPipeItem | GenericPipeItemAsync>]
        >
      >;

type SchemaMaybeWithPipe<TSchema extends Schema> = Optional<
  TSchema extends GenericSchema
    ? SchemaWithPipe<MaybeReadonly<[TSchema, ...GenericPipeItem[]]>>
    : SchemaWithPipeAsync<
        MaybeReadonly<
          [TSchema, ...Array<GenericPipeItem | GenericPipeItemAsync>]
        >
      >,
  `pipe`
>;

type CustomMock = <TSchema extends Schema>(
  schema: SchemaMaybeWithPipe<TSchema>,
  options?: ValimockOptions
) => unknown;

type CreateMockReturn<
  C extends Schema | null,
  R extends Schema | null
> = C extends Schema
  ? R extends Schema
    ? { config: InferOutput<C>; expected: InferOutput<R> }
    : { config: InferOutput<C>; expected: null }
  : R extends Schema
    ? { config: null; expected: InferOutput<R> }
    : { config: null; expected: null };

export class MockUtils {
  #customMocks: CustomMock = () => {};
  #discord: DiscordSession;
  #msw: SetupServer = setupServer();
  static uid = new Snowflake({ custom_epoch: 1420070400000 });

  get uid(): Snowflake {
    return MockUtils.uid;
  }

  static #getTransforms([_, ...pipe]:
    | GenericPipe
    | GenericPipeAsync
    | []): GenericTransformation[] {
    return (
      pipe as Array<
        GenericPipeItem | GenericPipeItemAsync | GenericTransformationActon
      >
    ).reduce<GenericTransformation[]>((arr, item) => {
      if (isOfKind(`transformation`, item) && isOfType(`transform`, item)) {
        arr.push(item.operation);
      }
      return arr;
    }, []);
  }

  static applyTransforms = <TSchema extends Schema>(
    schema: SchemaMaybeWithPipe<TSchema>,
    val: InferInput<TSchema>
  ): InferOutput<TSchema> =>
    schema.pipe
      ? this.#getTransforms(schema.pipe).reduce(
          (result, transform) => transform(result),
          val
        )
      : val;

  static flags = (flags: {
    [key: string]: number | bigint | string;
  }): bigint => {
    const values = Object.values(flags).filter((flag) => !isNaN(Number(flag)));
    return [
      ...new Set(
        faker.helpers.multiple(() => faker.helpers.arrayElement(values), {
          count: {
            min: 1,
            max: values.length
          }
        })
      )
    ].reduce<bigint>((total, flag) => total | BigInt(flag), 0n);
  };

  static hasPipe = <TSchema extends Schema>(
    val: SchemaMaybeWithPipe<TSchema>
  ): val is GenericSchemaWithPipe<TSchema> =>
    `pipe` in val && Array.isArray(val.pipe);

  static titlesMatch = (
    a: SchemaMaybeWithPipe<SchemaMaybeWithTitle>,
    b: SchemaMaybeWithPipe<SchemaMaybeWithTitle>
  ): a is typeof b =>
    this.hasPipe(a) && this.hasPipe(b) && getTitle(a) === getTitle(b);

  constructor(
    discord: DiscordSession,
    options?: {
      token?: string;
      customMocks?: CustomMock;
      debug?: boolean;
    }
  ) {
    this.#discord = discord;
    this.#discord.setToken(options?.token ?? `Bot super-secret-token`);
    if (options?.customMocks) {
      this.#customMocks = options.customMocks;
    }
    if (options?.debug) {
      this.#enableDebugging();
    }
    this.#msw.listen({ onUnhandledRequest: `error` });
  }

  #enableDebugging = (): void => {
    this.#msw.events.on(`request:start`, ({ request }) => {
      console.log(`Outgoing request: ${request.method} ${request.url}`);
    });
    this.#msw.events.on(`request:match`, ({ request }) => {
      console.log(`Matched request: ${request.method} ${request.url}`);
    });
    this.#msw.events.on(`response:mocked`, ({ request, response }) => {
      if (response.status !== 200) {
        console.log(
          `Mocked request: ${request.method} ${request.url} received ${response.status} ${response.statusText}`
        );
      }
    });
  };

  schema = <T extends Schema>(
    schema: T,
    opts?: Partial<ValimockOptions>
  ): InferOutput<T> =>
    new Valimock({
      ...opts,
      customMocks: {
        custom: this.#customMocks
      }
    }).mock(schema);

  #serialize = (val: unknown): string => {
    try {
      return JSON.stringify(val);
    } catch (err) {
      console.error({ val });
      throw new Error(`Failed to serliaze value`, {
        ...err,
        cause: val
      });
    }
  };

  #createMock(type: keyof typeof http) {
    return <C extends Schema, R extends Schema>(
      path: string,
      configSchema?: C | null,
      resultSchema?: R | null,
      opts?: Partial<ValimockOptions>
    ): CreateMockReturn<C, R> => {
      const config = configSchema ? this.schema(configSchema, opts) : null;
      const expected = resultSchema ? this.schema(resultSchema, opts) : null;
      const result = this.#serialize(expected);

      try {
        this.#msw.use(
          http[type](
            new URL(path.replace(/^\//, ``), this.#discord.endpoint).href,
            () => {
              try {
                const response = new Response(result, {
                  headers: {
                    "Content-Type": `application/json`
                  }
                });
                return response;
              } catch (err) {
                throw new Error(`Failed to create Response!`, err);
              }
            }
          )
        );
      } catch (err) {
        throw new Error(`Failed to mock request!`, err);
      }

      return {
        config,
        expected
      } as CreateMockReturn<C, R>;
    };
  }

  reset = (): void => {
    this.#msw.resetHandlers();
    this.#msw.close();
    this.#msw.listen({ onUnhandledRequest: `error` });
  };

  request = {
    delete: this.#createMock(`delete`),
    get: this.#createMock(`get`),
    patch: this.#createMock(`patch`),
    post: this.#createMock(`post`),
    put: this.#createMock(`put`)
  };
}
