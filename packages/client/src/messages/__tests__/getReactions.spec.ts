import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  getReactionsProcedure,
  getReactionsQuery,
  getReactionsSafe,
  getReactionsSchema
} from "../getReactions.js";
import { userSchema } from "../../user/types/User.js";

describe(`getReactions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/messages/:message/reactions/:emoji`,
    getReactionsSchema,
    pipe(array(userSchema), length(1)),
    { seed: 1 }
  );

  it(`can be used standalone`, async () => {
    await expect(getReactionsSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(getReactionsProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getReactionsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
