import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { moderationRuleSchema } from "../types";
import {
  createAutoModerationRule,
  createAutoModerationRuleSchema
} from "../createAutoModerationRule";

describe(`createAutoModerationRule`, () => {
  const expected = mockRequest.post(
    `/guilds/:guild/auto-moderation/rules`,
    moderationRuleSchema,
    { seed: 1 }
  );
  const config = generateMock(createAutoModerationRuleSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createAutoModerationRule(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createAutoModerationRule);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
