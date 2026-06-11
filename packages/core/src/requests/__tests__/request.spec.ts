import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll
} from "vite-plus/test";
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
      { id: string; name: string; type: number }[]
    >(new URL(`https://discord.com/api/v10/guilds/${guildId}/channels`));

    expect(channels).toHaveLength(2);
    expect(channels[0].name).toBe(`general`);
    expect(channels[1].name).toBe(`announcements`);
  });

  describe(`requestOptions`, () => {
    it(`omits the Authorization header when anonymous: true`, async () => {
      const authHeaders: (string | null)[] = [];

      server.use(
        http.post(
          `https://discord.com/api/v10/webhooks/1/abc`,
          ({ request: req }) => {
            authHeaders.push(req.headers.get(`Authorization`));
            return new Response(null, { status: 204 });
          }
        )
      );

      // The session has no token at all — anonymous calls must not require one.
      discord.clearSession();

      await request(
        new URL(`https://discord.com/api/v10/webhooks/1/abc`),
        `POST`,
        { content: `hello` },
        { anonymous: true }
      );

      expect(authHeaders).toEqual([null]);
    });

    it(`throws when an auth'd request is made without a session`, async () => {
      discord.clearSession();
      await expect(
        request(new URL(`https://discord.com/api/v10/users/@me`), `GET`)
      ).rejects.toThrow(/Auth Token must be set/);
    });

    it(`forwards the reason as an URL-encoded X-Audit-Log-Reason header`, async () => {
      const reasons: (string | null)[] = [];

      server.use(
        http.delete(
          `https://discord.com/api/v10/channels/123`,
          ({ request: req }) => {
            reasons.push(req.headers.get(`X-Audit-Log-Reason`));
            return new Response(null, { status: 204 });
          }
        )
      );

      discord.clearSession();
      discord.setToken(`Bot test-token`);

      await request(
        new URL(`https://discord.com/api/v10/channels/123`),
        `DELETE`,
        undefined,
        {
          reason: `Spring cleaning — duplicate channel`
        }
      );

      expect(reasons).toEqual([
        encodeURIComponent(`Spring cleaning — duplicate channel`)
      ]);
    });
  });
});
