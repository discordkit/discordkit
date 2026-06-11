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

    it(`uses the user token (asUser) over the session token`, async () => {
      // WHY: user-scoped OAuth2 calls run inside asUser().request(); the user's
      // bearer token must take precedence over the global bot session token,
      // and asUser prepends the `Bearer ` prefix to the bare access token.
      const authHeaders: (string | null)[] = [];
      server.use(
        http.get(
          `https://discord.com/api/v10/users/@me`,
          ({ request: req }) => {
            authHeaders.push(req.headers.get(`Authorization`));
            return Response.json({ id: `1` });
          }
        )
      );

      discord.clearSession();
      discord.setToken(`Bot global-bot-token`);

      const user = discord.asUser(`user-access-token`);
      await user.request(async () =>
        request(new URL(`https://discord.com/api/v10/users/@me`), `GET`)
      );

      expect(authHeaders).toEqual([`Bearer user-access-token`]);
      // request() restored the previous (bot) token afterwards.
      expect(discord.getSession()).toBe(`Bot global-bot-token`);
    });

    it(`restores the previous token after request() resolves, even on throw`, async () => {
      // WHY: a user token must not leak past its request() scope — otherwise a
      // later request (e.g. on a reused serverless instance) could send it.
      server.use(
        http.get(`https://discord.com/api/v10/users/@me`, () =>
          HttpResponse.text(`boom`, { status: 500 })
        )
      );
      discord.clearSession();
      discord.setToken(`Bot global-bot-token`);

      const user = discord.asUser(`user-access-token`);
      await expect(
        user.request(async () =>
          request(new URL(`https://discord.com/api/v10/users/@me`), `GET`)
        )
      ).rejects.toThrow();

      // Despite the throw, the active token was restored.
      expect(discord.getSession()).toBe(`Bot global-bot-token`);
    });

    it(`disposes a lingering user token at scope exit (using)`, async () => {
      // WHY: the `using` disposal is the safety net for tokens left active
      // outside a request() call. We simulate that by activating the token via
      // a request() that resolves, then leaving a second one pending — on scope
      // exit, dispose() must clear whatever is active so it can't leak into a
      // later request on a reused (warm) instance.
      server.use(
        http.get(`https://discord.com/api/v10/users/@me`, () =>
          Response.json({ id: `1` })
        )
      );
      discord.clearSession();

      {
        using user = discord.asUser(`user-access-token`);
        // A pending (not awaited) request leaves the token active when the
        // block exits — exactly the leak `using` guards against.
        const pending = user.request(async () =>
          request(new URL(`https://discord.com/api/v10/users/@me`), `GET`)
        );
        expect(discord.hasAuth).toBe(true);
        await pending;
      }

      // Dispose ran on scope exit; no token remains active.
      expect(discord.hasAuth).toBe(false);
    });

    it(`allows a user token when the session is unset`, async () => {
      // WHY: a server handling per-user requests may never set a global session
      // — the user token alone must satisfy the auth guard.
      const authHeaders: (string | null)[] = [];
      server.use(
        http.get(
          `https://discord.com/api/v10/users/@me`,
          ({ request: req }) => {
            authHeaders.push(req.headers.get(`Authorization`));
            return Response.json({ id: `1` });
          }
        )
      );

      discord.clearSession();
      const user = discord.asUser(`solo-user-token`);
      await user.request(async () =>
        request(new URL(`https://discord.com/api/v10/users/@me`), `GET`)
      );

      expect(authHeaders).toEqual([`Bearer solo-user-token`]);
      // No session token remained active after the scoped request.
      expect(discord.hasAuth).toBe(false);
    });
  });
});
