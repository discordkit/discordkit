import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { discord } from "../DiscordSession.js";
import { request } from "../request.js";

const server = setupServer();

describe(`request`, () => {
  beforeAll(() => server.listen({ onUnhandledRequest: `error` }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it(`processes fetch requests in a queue`, async () => {
    const guildId = `123456789`;

    server.use(
      http.get(`https://discord.com/api/v10/guilds/${guildId}/channels`, () => {
        return HttpResponse.json(
          [
            { id: `1`, name: `general`, type: 0 },
            { id: `2`, name: `announcements`, type: 0 }
          ],
          {
            headers: {
              "Content-Type": `application/json`,
              "X-RateLimit-Limit": `5`,
              "X-RateLimit-Remaining": `4`,
              "X-RateLimit-Reset": String(Date.now() / 1000 + 5),
              "X-RateLimit-Reset-After": `5`,
              "X-RateLimit-Bucket": `guild-channels`
            }
          }
        );
      })
    );

    discord.clearSession();
    discord.setToken(`Bot test-token`);

    const channels = await request<
      Array<{ id: string; name: string; type: number }>
    >(new URL(`https://discord.com/api/v10/guilds/${guildId}/channels`));

    expect(channels).toHaveLength(2);
    expect(channels[0].name).toBe(`general`);
    expect(channels[1].name).toBe(`announcements`);
  });
});
