import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildPruneCountProcedure,
  getGuildPruneCountQuery,
  getGuildPruneCountSafe,
  getGuildPruneCountSchema,
  guildPruneCountSchema
} from "../getGuildPruneCount";

describe(`getGuildPruneCount`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/prune`,
    guildPruneCountSchema
  );
  const config = generateMock(getGuildPruneCountSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildPruneCountSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildPruneCountProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildPruneCountQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
