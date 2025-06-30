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

interface ClientSession {
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

type GenericTransformationOperation = GenericTransformationActon[`operation`];

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

type CustomMock = (
  schema: SchemaMaybeWithPipe<SchemaMaybeWithTitle>,
  options?: ValimockOptions
) => unknown;

type CreateMockReturn<
  TConfig extends Schema | null,
  TResult extends Schema | null
> = TConfig extends Schema
  ? TResult extends Schema
    ? { config: InferOutput<TConfig>; expected: InferOutput<TResult> }
    : { config: InferOutput<TConfig>; expected: null }
  : TResult extends Schema
    ? { config: null; expected: InferOutput<TResult> }
    : { config: null; expected: null };

interface Flags {
  [key: string]: number | bigint | string;
}

export class MockUtils {
  #customMocks = new Map<
    SchemaMaybeWithPipe<SchemaMaybeWithTitle>,
    CustomMock
  >();

  #session: ClientSession;
  #msw: SetupServer = setupServer();
  static uid = new Snowflake({ custom_epoch: 1420070400000 });

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  get uid(): Snowflake {
    return MockUtils.uid;
  }

  static #getTransforms([_, ...pipe]:
    | GenericPipe
    | GenericPipeAsync
    | []): GenericTransformationOperation[] {
    return (
      pipe as Array<
        GenericPipeItem | GenericPipeItemAsync | GenericTransformationActon
      >
    ).reduce<GenericTransformationOperation[]>((arr, item) => {
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

  static flags = (flags: Flags): bigint => {
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
    schemaA: SchemaMaybeWithPipe<SchemaMaybeWithTitle>,
    schemaB: SchemaMaybeWithPipe<SchemaMaybeWithTitle>
  ): schemaA is typeof schemaB =>
    this.hasPipe(schemaA) &&
    this.hasPipe(schemaB) &&
    getTitle(schemaA) === getTitle(schemaB);

  static flagMatcher =
    (flags: Flags) =>
    (reference: SchemaMaybeWithPipe<SchemaMaybeWithTitle>): bigint =>
      MockUtils.applyTransforms(reference, MockUtils.flags(flags));

  constructor(
    discord: ClientSession,
    options?: {
      token?: string;
      customMocks?: Array<
        [matcher: SchemaMaybeWithPipe<SchemaMaybeWithTitle>, mockFn: CustomMock]
      >;
      debug?: boolean;
    }
  ) {
    this.#session = discord;
    this.#session.setToken(options?.token ?? `Bot super-secret-token`);
    if (options?.customMocks) {
      this.#customMocks = new Map(options.customMocks);
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

  setMock = (schema: Schema, mockFn: CustomMock): this => {
    this.#customMocks.set(schema, mockFn);
    return this;
  };

  schema = <TSchema extends Schema>(
    schema: TSchema,
    opts?: Partial<ValimockOptions>
  ): InferOutput<TSchema> =>
    new Valimock({
      ...opts,
      customMocks: {
        custom: (reference): unknown => {
          // Iterate through the provided matchers and return the
          // first valid match
          for (const [target, mockfn] of this.#customMocks) {
            if (MockUtils.titlesMatch(reference, target)) {
              return mockfn(reference);
            }
          }
          throw new Error(
            `Unhandled custom schema: ${getTitle(reference) ?? reference.expects}`
          );
        }
      }
    }).mock(schema);

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  #serialize = (val: unknown): string | undefined => {
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
    return <TConfig extends Schema, TResult extends Schema>(
      path: string,
      configSchema?: TConfig | null,
      resultSchema?: TResult | null,
      opts?: Partial<ValimockOptions>
    ): CreateMockReturn<TConfig, TResult> => {
      const config = configSchema ? this.schema(configSchema, opts) : null;
      const expected = resultSchema ? this.schema(resultSchema, opts) : null;
      const result = this.#serialize(expected); //?

      try {
        this.#msw.use(
          http[type](
            new URL(path.replace(/^\//, ``), this.#session.endpoint).href,
            () => {
              try {
                const response = new Response(result ?? null, {
                  status: typeof result === `undefined` ? 204 : undefined,
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      return {
        config,
        expected
      } as CreateMockReturn<TConfig, TResult>;
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

  [Symbol.dispose](): void {
    this.#msw.resetHandlers();
    this.#msw.close();
  }
}
