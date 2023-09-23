import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  deleteAutoModerationRule,
  deleteAutoModerationRuleSchema
} from "../deleteAutoModerationRule";

describe(`deleteAutoModerationRule`, () => {
  mockRequest.delete(`/guilds/:guild/auto-moderation/rules/:rule`);
  const config = generateMock(deleteAutoModerationRuleSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteAutoModerationRule(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteAutoModerationRule);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
