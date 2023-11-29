import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildProcedure,
  getGuildQuery,
  getGuildSafe,
  getGuildSchema
} from "../getGuild.js";
import { guildSchema } from "../types/Guild.js";

describe(`getGuild`, () => {
  const expected = mockRequest.get(`/guilds/:id`, guildSchema);
  const config = mockSchema(getGuildSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(getGuildProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
