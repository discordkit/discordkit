import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  beginGuildPrune,
  beginGuildPruneProcedure,
  beginGuildPruneSafe,
  beginGuildPruneSchema,
  guildPruneResultSchema
} from "../beginGuildPrune.js";

describe(`beginGuildPrune`, () => {
  const expected = mockRequest.post(
    `/guilds/:guild/prune`,
    guildPruneResultSchema
  );
  const config = mockSchema(beginGuildPruneSchema);

  it(`can be used standalone`, async () => {
    await expect(beginGuildPruneSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(beginGuildPruneProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(beginGuildPrune);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
