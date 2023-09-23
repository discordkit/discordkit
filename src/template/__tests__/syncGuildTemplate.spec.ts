import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { guildTemplateSchema } from "../types";
import {
  syncGuildTemplate,
  syncGuildTemplateSchema
} from "../syncGuildTemplate";

describe(`syncGuildTemplate`, () => {
  const expected = mockRequest.put(
    `/guilds/:guild/templates/:template`,
    guildTemplateSchema
  );
  const config = generateMock(syncGuildTemplateSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.syncGuildTemplate(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(syncGuildTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
