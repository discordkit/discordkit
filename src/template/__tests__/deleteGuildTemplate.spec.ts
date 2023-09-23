import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  deleteGuildTemplate,
  deleteGuildTemplateSchema
} from "../deleteGuildTemplate";

describe(`deleteGuildTemplate`, () => {
  mockRequest.delete(`/guilds/:guild/templates/:template`);
  const config = generateMock(deleteGuildTemplateSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteGuildTemplate(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteGuildTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
