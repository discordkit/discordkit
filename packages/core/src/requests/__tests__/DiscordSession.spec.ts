import { DiscordSession } from "../DiscordSession.js";

describe(`discordSession`, () => {
  it(`supports setting the auth token`, () => {
    const instance = new DiscordSession();

    expect(instance.ready).toBe(false);
    expect(() => instance.getSession()).toThrow(`Auth Token must be set`);

    instance.setToken(`Bot <bot-token>`);
    expect(instance.ready).toBe(true);
    expect(instance.getSession()).toBe(`Bot <bot-token>`);

    instance.clearSession();
    expect(instance.ready).toBe(false);

    instance.setToken(`Bearer <client-token>`);
    expect(instance.ready).toBe(true);
    expect(instance.getSession()).toBe(`Bearer <client-token>`);

    instance.clearSession();
    // @ts-expect-error
    expect(() => instance.setToken(`invalid token`)).toThrow(
      `Token must begin with either`
    );

    // @ts-expect-error
    expect(() => instance.setToken(``)).toThrow(
      `Must provide a non-empty string`
    );
    expect(instance.ready).toBe(false);

    const presetBot = new DiscordSession(`Bot <bot-token>`);

    expect(presetBot.ready).toBe(true);
    expect(presetBot.getSession()).toBe(`Bot <bot-token>`);

    const presetClient = new DiscordSession(`Bearer <client-token>`);

    expect(presetClient.ready).toBe(true);
    expect(presetClient.getSession()).toBe(`Bearer <client-token>`);
  });
});
