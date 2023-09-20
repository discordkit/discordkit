import { mockRequest } from "../../../jest.setup";
import { client } from "../__fixtures__/router";
import { stickerSchema } from "../types";
import { nitroStickerPacksSchema } from "../listNitroStickerPacks";

describe(`stickers`, () => {
  it(`createGuildSticker`, async () => {
    const result = mockRequest.post(`/guilds/:guild/stickers`, stickerSchema);
    const actual = await client.createGuildSticker({
      guild: `foo`,
      body: {
        name: `bar`,
        description: `baz`,
        tags: `qux`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`deleteGuildSticker`, () => {
    mockRequest.delete(`/guilds/:guild/stickers/:sticker`);
    expect(async () =>
      client.deleteGuildSticker({
        guild: `foo`,
        sticker: `bar`
      })
    ).not.toThrow();
  });

  it(`getGuildSticker`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/stickers/:sticker`,
      stickerSchema
    );
    const actual = await client.getGuildSticker({
      guild: `foo`,
      sticker: `bar`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getSticker`, async () => {
    const result = mockRequest.get(`/stickers/:sticker`, stickerSchema);
    const actual = await client.getSticker({
      sticker: `foo`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`listGuildStickers`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/stickers`,
      stickerSchema.array()
    );
    const actual = await client.listGuildStickers({
      guild: `foo`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`listNitroStickerPacks`, async () => {
    const result = mockRequest.get(`/sticker-packs`, nitroStickerPacksSchema);
    const actual = await client.listNitroStickerPacks();
    expect(actual).toStrictEqual(result);
  });

  it(`modifyGuildSticker`, async () => {
    const result = mockRequest.patch(
      `/guilds/:guild/stickers/:sticker`,
      stickerSchema
    );
    const actual = await client.modifyGuildSticker({
      guild: `foo`,
      sticker: `bar`,
      body: {
        name: `baz`
      }
    });
    expect(actual).toStrictEqual(result);
  });
});
