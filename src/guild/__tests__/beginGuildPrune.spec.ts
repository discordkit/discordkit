import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  beginGuildPrune,
  beginGuildPruneProcedure,
  beginGuildPruneSchema,
  guildPruneResultSchema
} from "../beginGuildPrune";

describe(`beginGuildPrune`, () => {
  const expected = mockRequest.post(
    `/guilds/:guild/prune`,
    guildPruneResultSchema
  );
  const config = generateMock(beginGuildPruneSchema);

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
