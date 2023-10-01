import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getReactionsProcedure,
  getReactionsQuery,
  getReactionsSafe,
  getReactionsSchema
} from "../getReactions.ts";
import { userSchema } from "../../user/types/User.ts";

describe(`getReactions`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/messages/:message/reactions/:emoji`,
    userSchema.partial().array().length(1)
  );
  const config = mockSchema(getReactionsSchema);

  it(`can be used standalone`, async () => {
    await expect(getReactionsSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getReactionsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getReactionsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
