import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { userSchema } from "../../user/types/User.js";
import {
  getReactionsProcedure,
  getReactionsQuery,
  getReactionsSafe,
  getReactionsSchema
} from "../getReactions.js";

describe(`getReactions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/messages/:message/reactions/:emoji`,
    getReactionsSchema,
    v.pipe(v.array(userSchema), v.length(1)),
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
