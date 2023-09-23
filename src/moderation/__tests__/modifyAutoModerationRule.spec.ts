import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { moderationRuleSchema } from "../types";
import {
  modifyAutoModerationRule,
  modifyAutoModerationRuleSchema
} from "../modifyAutoModerationRule";

describe(`modifyAutoModerationRule`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/auto-moderation/rules/:rule`,
    moderationRuleSchema,
    { seed: 1 }
  );
  const config = generateMock(modifyAutoModerationRuleSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyAutoModerationRule(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyAutoModerationRule);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
