import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { moderationRuleSchema } from "../types";
import {
  getAutoModerationRuleQuery,
  getAutoModerationRuleSchema
} from "../getAutoModerationRule";

describe(`getAutoModerationRule`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/auto-moderation/rules/:rule`,
    moderationRuleSchema,
    { seed: 1 }
  );
  const config = generateMock(getAutoModerationRuleSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getAutoModerationRule(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getAutoModerationRuleQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
