import {
  safeParseAsync,
  type BaseSchema,
  type BaseSchemaAsync,
  type Input,
  type Output
} from "valibot";

export interface ValidationIssue {
  message: string;
  path?: unknown[];
}

export interface TypeSchema<TOutput, TInput = TOutput> {
  _input: TInput;
  _output: TOutput;
  assert(data: unknown): Promise<TOutput>;
  parse(data: unknown): Promise<TOutput>;
  validate(
    data: unknown
  ): Promise<{ data: TOutput } | { issues: ValidationIssue[] }>;
}

export type Wrap<T extends BaseSchema | BaseSchemaAsync> = TypeSchema<
  Output<T>,
  Input<T>
>;

// Adapted from https://github.com/decs/typeschema
export function wrap<TSchema extends BaseSchema | BaseSchemaAsync>(
  schema: TSchema
): TypeSchema<Output<TSchema>, Input<TSchema>> {
  const validate = async (
    data: unknown
  ): Promise<{ data: Output<TSchema> } | { issues: ValidationIssue[] }> => {
    const result = await safeParseAsync(schema, data);
    if (result.success) {
      return {
        data: result.output
      };
    }
    return {
      issues: result.issues.map(({ message, path }) => ({
        message,
        path: path?.map(({ key }) => key) ?? []
      }))
    };
  };

  const assert = async (data: unknown): Promise<Output<TSchema>> => {
    const result = await validate(data);
    if (`data` in result) return result.data;
    throw new AggregateError(result.issues, `Assertion failed`);
  };

  return {
    // eslint-disable-next-line no-undefined
    _input: undefined as Input<typeof schema>,
    // eslint-disable-next-line no-undefined
    _output: undefined as Output<typeof schema>,
    assert,
    parse: assert,
    validate
  };
}
