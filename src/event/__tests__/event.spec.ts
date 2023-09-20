import { mockRequest } from "../../../jest.setup";
import { client } from "../__fixtures__/router";
import { scheduledEventSchema, scheduledEventUserSchema } from "../types";

describe(`events`, () => {
  it(`createGuildScheduledEvent`, async () => {
    const result = mockRequest.post(
      `/guilds/:guild/scheduled-events`,
      scheduledEventSchema
    );
    const actual = await client.createGuildScheduledEvent({
      guild: `foo`,
      body: {
        name: `bar`,
        scheduledStartTime: `baz`,
        privacyLevel: 2,
        entityType: 2,
        entityMetadata: {}
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`deleteGuildScheduledEvent`, () => {
    mockRequest.delete(`/guilds/:guild/scheduled-events/:event`);
    expect(async () =>
      client.deleteGuildScheduledEvent({
        guild: `foo`,
        event: `bar`
      })
    ).not.toThrow();
  });

  it(`getGuildScheduledEvent`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/scheduled-events/:event`,
      scheduledEventSchema
    );
    const actual = await client.getGuildScheduledEvent({
      guild: `foo`,
      event: `bar`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getGuildScheduledEventUsers`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/scheduled-events/:event/users`,
      scheduledEventUserSchema.array()
    );
    const actual = await client.getGuildScheduledEventUsers({
      guild: `foo`,
      event: `bar`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`listScheduledEventsForGuild`, async () => {
    const result = mockRequest.get(
      `/guilds/:guild/scheduled-events`,
      scheduledEventSchema.array()
    );
    const actual = await client.listScheduledEventsForGuild({
      guild: `foo`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`modifyGuildScheduledEvent`, async () => {
    const result = mockRequest.patch(
      `/guilds/:guild/scheduled-events/:event`,
      scheduledEventSchema
    );
    const actual = await client.modifyGuildScheduledEvent({
      guild: `foo`,
      event: `bar`,
      body: {
        name: `baz`
      }
    });
    expect(actual).toStrictEqual(result);
  });
});
