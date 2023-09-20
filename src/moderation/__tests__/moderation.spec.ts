import { mockRequest } from "../../../jest.setup";
import { client } from "../__fixtures__/router";
import { moderationRuleSchema } from "../types";

describe(`moderation`, () => {
  it(`createAutoModerationRule`, async () => {
    const result = mockRequest.post(
      `/guilds/:guild/auto-moderation/rules`,
      moderationRuleSchema,
      { seed: 1 }
    );
    const actual = await client.createAutoModerationRule({
      guild: `foo`,
      body: {
        name: `bar`,
        eventType: 1,
        triggerType: 1,
        actions: [
          {
            type: 1
          }
        ]
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`deleteAutoModerationRule`, () => {
    mockRequest.delete(`/guilds/:guild/auto-moderation/rules/:rule`);
    expect(async () =>
      client.deleteAutoModerationRule({
        guild: `foo`,
        rule: `bar`
      })
    ).not.toThrow();
  });

  it(`getAutoModerationRule`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/auto-moderation/rules/:rule`,
      moderationRuleSchema,
      { seed: 1 }
    );
    const actual = await client.getAutoModerationRule({
      guild: `foo`,
      rule: `bar`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`modifyAutoModerationRule`, async () => {
    const result = mockRequest.patch(
      `/guilds/:guild/auto-moderation/rules/:rule`,
      moderationRuleSchema,
      { seed: 1 }
    );
    const actual = await client.modifyAutoModerationRule({
      guild: `foo`,
      rule: `bar`,
      body: {
        name: `baz`
      }
    });
    expect(actual).toStrictEqual(result);
  });
});
