import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildPruneCountProcedure,
  getGuildPruneCountQuery,
  getGuildPruneCountSafe,
  getGuildPruneCountSchema,
  guildPruneCountSchema
} from "../getGuildPruneCount.js";

describe(`getGuildPruneCount`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/prune`,
    guildPruneCountSchema
  );
  const config = mockSchema(getGuildPruneCountSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildPruneCountSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildPruneCountProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildPruneCountQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
