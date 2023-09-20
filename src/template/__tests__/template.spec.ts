import { mockRequest } from "../../../jest.setup";
import { client } from "../__fixtures__/router";
import { guildSchema } from "../../guild";
import { guildTemplateSchema } from "../types";

describe(`templates`, () => {
  it(`createGuildFromTemplate`, async () => {
    const result = mockRequest.post(`/guilds/templates/:template`, guildSchema);
    const actual = await client.createGuildFromTemplate({
      template: `foo`,
      body: {
        name: `bar`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`createGuildTemplate`, async () => {
    const result = mockRequest.post(
      `/guilds/:guild/templates`,
      guildTemplateSchema
    );
    const actual = await client.createGuildTemplate({
      guild: `foo`,
      body: {
        name: `bar`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`deleteGuildTemplate`, () => {
    mockRequest.delete(`/guilds/:guild/templates/:template`);
    expect(async () =>
      client.deleteGuildTemplate({
        guild: `foo`,
        template: `bar`
      })
    ).not.toThrow();
  });

  it(`getGuildTemplate`, async () => {
    const result = mockRequest.get(
      `/guilds/templates/:template`,
      guildTemplateSchema
    );
    const actual = await client.getGuildTemplate({
      template: `foo`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildTemplates`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/templates`,
      guildTemplateSchema.array()
    );
    const actual = await client.getGuildTemplates({
      guild: `foo`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`modifyGuildTemplate`, async () => {
    const result = mockRequest.patch(
      `/guilds/:guild/templates/:template`,
      guildTemplateSchema
    );
    const actual = await client.modifyGuildTemplate({
      guild: `foo`,
      template: `bar`,
      body: {
        name: `qux`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`syncGuildTemplate`, async () => {
    const result = mockRequest.put(
      `/guilds/:guild/templates/:template`,
      guildTemplateSchema
    );
    const actual = await client.syncGuildTemplate({
      guild: `foo`,
      template: `bar`
    });
    expect(actual).toStrictEqual(result);
  });
});
