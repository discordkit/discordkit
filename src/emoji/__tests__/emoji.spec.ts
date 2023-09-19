import { mockRequest } from "../../../jest.setup";
import { client } from "../__fixtures__/router";
import { emojiSchema } from "../types";

describe(`emojis`, () => {
  it(`createGuildEmoji`, async () => {
    const result = mockRequest.post(`/guilds/:guild/emojis`, emojiSchema);
    const actual = await client.createGuildEmoji({
      guild: `bar`,
      body: {
        name: `foo`,
        roles: [`qux`],
        image: `baz`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`deleteGuildEmoji`, () => {
    mockRequest.delete(`/guilds/:guild/emojis/:emoji`, emojiSchema);
    expect(async () =>
      client.deleteGuildEmoji({
        guild: `foo`,
        emoji: `bar`
      })
    ).not.toThrow();
  });

  it(`getGuildEmoji`, async () => {
    const result = mockRequest.get(`/guilds/:guild/emojis/:emoji`, emojiSchema);
    const actual = await client.getGuildEmoji({
      guild: `foo`,
      emoji: `bar`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`listGuildEmojis`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/emojis`,
      emojiSchema.array()
    );
    const actual = await client.listGuildEmojis({
      guild: `foo`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`modifyGuildEmoji`, async () => {
    const result = mockRequest.patch(
      `/guilds/:guild/emojis/:emoji`,
      emojiSchema
    );
    const actual = await client.modifyGuildEmoji({
      guild: `foo`,
      emoji: `bar`,
      body: {
        name: `qux`
      }
    });
    expect(actual).toStrictEqual(result);
  });
});
