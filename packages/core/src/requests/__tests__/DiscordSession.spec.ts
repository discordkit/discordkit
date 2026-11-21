import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll,
  vi
} from "vite-plus/test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  DiscordSession,
  TOKEN_ENV_VAR,
  tokenFromEnv
} from "../DiscordSession.js";
import { sleep } from "../../utils/sleep.js";

const server = setupServer();

describe(`discordSession`, () => {
  beforeAll(() => server.listen({ onUnhandledFrame: `error` }));
  afterEach(() => {
    server.resetHandlers();
    vi.unstubAllEnvs();
  });
  afterAll(() => server.close());

  it(`supports setting the auth token`, () => {
    // Pin the environment: the session falls back to DISCORD_BOT_TOKEN, so a
    // real token in the developer's shell would otherwise make `ready` true
    // and this test pass for the wrong reason.
    vi.stubEnv(TOKEN_ENV_VAR, undefined);
    const instance = new DiscordSession();

    expect(instance.ready).toBe(false);
    expect(() => instance.getSession()).toThrow(`No Discord token is set`);

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

  describe(`environment token fallback`, () => {
    it(`authorizes from DISCORD_BOT_TOKEN when no token is set`, () => {
      // A bot needs no setup beyond .env, matching @discordkit/gateway, which
      // reads the same variable. Both clients take the same secret.
      vi.stubEnv(TOKEN_ENV_VAR, `env-token`);
      const instance = new DiscordSession();

      expect(instance.ready).toBe(true);
      expect(instance.getSession()).toBe(`Bot env-token`);
    });

    it(`adds the Bot prefix the environment value omits`, () => {
      // .env holds the raw secret Discord issues; the Authorization header
      // needs a scheme. Storing the prefix in .env would be a second format to
      // get wrong.
      vi.stubEnv(TOKEN_ENV_VAR, `raw`);
      expect(tokenFromEnv()).toBe(`Bot raw`);
    });

    it(`prefers an explicitly set token over the environment`, () => {
      // A process may act as more than one identity, so an explicit call must
      // never be silently overridden by ambient configuration.
      vi.stubEnv(TOKEN_ENV_VAR, `env-token`);
      const instance = new DiscordSession();
      instance.setToken(`Bot explicit`);

      expect(instance.getSession()).toBe(`Bot explicit`);
    });

    it(`ignores an empty environment value`, () => {
      // An unset variable reads as "" in many shells and CI configs. Treating
      // that as a token would send `Bot ` and earn an opaque 401.
      vi.stubEnv(TOKEN_ENV_VAR, ``);
      expect(tokenFromEnv()).toBeNull();
      expect(new DiscordSession().ready).toBe(false);
    });

    it(`reports auth as available so requests are not rejected early`, () => {
      // request.ts gates on `hasAuth`, not `ready`. If the fallback missed that
      // getter, every request would throw before the header was ever built.
      vi.stubEnv(TOKEN_ENV_VAR, `env-token`);
      expect(new DiscordSession().hasAuth).toBe(true);
    });
  });

  describe(`rate limiting`, () => {
    it(`respects per-route rate limits`, async () => {
      const guildId = `123456789`;
      let requestCount = 0;

      server.use(
        http.get(
          `https://discord.com/api/v10/guilds/${guildId}/channels`,
          () => {
            requestCount++;

            const headers: Record<string, string> = {
              "Content-Type": `application/json`,
              "X-RateLimit-Limit": `5`,
              "X-RateLimit-Bucket": `guild-channels`,
              "X-RateLimit-Reset-After": `2`
            };

            // First 5 requests succeed
            if (requestCount <= 5) {
              headers[`X-RateLimit-Remaining`] = String(5 - requestCount);
              headers[`X-RateLimit-Reset`] = String(Date.now() / 1000 + 2);

              return HttpResponse.json(
                [{ id: `1`, name: `general`, type: 0 }],
                { headers }
              );
            }

            // 6th request hits rate limit
            if (requestCount === 6) {
              headers[`X-RateLimit-Remaining`] = `0`;
              headers[`X-RateLimit-Reset`] = String(Date.now() / 1000 + 2);
              headers[`Retry-After`] = `2`;
              headers[`X-RateLimit-Scope`] = `user`;

              return HttpResponse.json(
                {
                  message: `You are being rate limited.`,
                  retry_after: 2,
                  global: false
                },
                { status: 429, headers }
              );
            }

            // After retry, requests succeed again
            headers[`X-RateLimit-Remaining`] = `4`;
            headers[`X-RateLimit-Reset`] = String(Date.now() / 1000 + 2);
            return HttpResponse.json([{ id: `1`, name: `general`, type: 0 }], {
              headers
            });
          }
        )
      );

      const session = new DiscordSession(`Bot test-token`);
      const startTime = Date.now();

      // Make 7 requests - the 6th will be rate limited
      const promises = Array.from({ length: 7 }, async () =>
        session.queueRequest(
          new URL(`https://discord.com/api/v10/guilds/${guildId}/channels`),
          `GET`
        )
      );

      await Promise.all(promises);
      const elapsed = Date.now() - startTime;

      // Should take at least 2 seconds due to rate limit
      expect(elapsed).toBeGreaterThanOrEqual(1900);
      expect(requestCount).toBeGreaterThanOrEqual(7);
      // About 4s: the session waits out the reset the 5th response announces,
      // then this handler still answers the 6th request with a 429.
    }, 10000);

    it(`handles global rate limits`, async () => {
      const guildId = `123456789`;
      let requestCount = 0;

      server.use(
        http.get(
          `https://discord.com/api/v10/guilds/${guildId}/channels`,
          () => {
            requestCount++;

            if (requestCount === 3) {
              return HttpResponse.json(
                {
                  message: `You are being rate limited.`,
                  retry_after: 1,
                  global: true
                },
                {
                  status: 429,
                  headers: {
                    "Retry-After": `1`,
                    "X-RateLimit-Global": `true`,
                    "X-RateLimit-Scope": `global`
                  }
                }
              );
            }

            return HttpResponse.json([{ id: `1`, name: `general`, type: 0 }], {
              headers: {
                "X-RateLimit-Limit": `5`,
                "X-RateLimit-Remaining": `4`,
                "X-RateLimit-Reset": String(Date.now() / 1000 + 5),
                "X-RateLimit-Reset-After": `5`,
                "X-RateLimit-Bucket": `guild-channels`
              }
            });
          }
        )
      );

      const session = new DiscordSession(`Bot test-token`);
      const startTime = Date.now();

      // Make 5 requests
      const promises = Array.from({ length: 5 }, async () =>
        session.queueRequest(
          new URL(`https://discord.com/api/v10/guilds/${guildId}/channels`),
          `GET`
        )
      );

      await Promise.all(promises);
      const elapsed = Date.now() - startTime;

      // Should take at least 1 second due to global rate limit
      expect(elapsed).toBeGreaterThanOrEqual(900);
    });

    it(`enforces 50 requests per second global limit`, async () => {
      const webhookId = `123456789`;
      const webhookToken = `webhook-token`;

      server.use(
        http.post(
          `https://discord.com/api/v10/webhooks/${webhookId}/${webhookToken}`,
          () => {
            return HttpResponse.json(
              { id: `1`, channel_id: `2` },
              {
                status: 204,
                headers: {
                  "X-RateLimit-Limit": `5`,
                  "X-RateLimit-Remaining": `4`,
                  "X-RateLimit-Reset": String(Date.now() / 1000 + 1),
                  "X-RateLimit-Reset-After": `1`,
                  "X-RateLimit-Bucket": `webhook`
                }
              }
            );
          }
        )
      );

      const session = new DiscordSession(`Bot test-token`);
      const startTime = Date.now();

      // Make 60 requests (more than the 50/second limit)
      const promises = Array.from({ length: 60 }, async () =>
        session.queueRequest(
          new URL(
            `https://discord.com/api/v10/webhooks/${webhookId}/${webhookToken}`
          ),
          `POST`,
          JSON.stringify({ content: `test` })
        )
      );

      await Promise.all(promises);
      const elapsed = Date.now() - startTime;

      // Should take at least 1 second to enforce the 50/s limit
      expect(elapsed).toBeGreaterThanOrEqual(900);
    });

    it(`tracks and retries 429 responses with Retry-After header`, async () => {
      const guildId = `123456789`;
      let attemptCount = 0;

      server.use(
        http.get(
          `https://discord.com/api/v10/guilds/${guildId}/channels`,
          () => {
            attemptCount++;
            console.log(`Attempt ${attemptCount}`); // Debug logging

            // First attempt returns 429
            if (attemptCount === 1) {
              return HttpResponse.json(
                {
                  message: `You are being rate limited.`,
                  retry_after: 0.5,
                  global: false
                },
                {
                  status: 429,
                  headers: {
                    "Retry-After": `0.5`,
                    "X-RateLimit-Limit": `5`,
                    "X-RateLimit-Remaining": `0`,
                    "X-RateLimit-Reset": String(Date.now() / 1000 + 0.5),
                    "X-RateLimit-Reset-After": `0.5`,
                    "X-RateLimit-Bucket": `guild-channels`,
                    "X-RateLimit-Scope": `user`
                  }
                }
              );
            }

            // Retry succeeds
            return HttpResponse.json([{ id: `1`, name: `general`, type: 0 }], {
              headers: {
                "X-RateLimit-Limit": `5`,
                "X-RateLimit-Remaining": `4`,
                "X-RateLimit-Reset": String(Date.now() / 1000 + 5),
                "X-RateLimit-Reset-After": `5`,
                "X-RateLimit-Bucket": `guild-channels`
              }
            });
          }
        )
      );

      const session = new DiscordSession(`Bot test-token`);
      const startTime = Date.now();

      const response = await session.queueRequest(
        new URL(`https://discord.com/api/v10/guilds/${guildId}/channels`),
        `GET`
      );

      const elapsed = Date.now() - startTime;

      console.log(`Total attempts: ${attemptCount}, elapsed: ${elapsed}ms`);

      expect(response.status).toBe(200);
      expect(attemptCount).toBe(2);
      expect(elapsed).toBeGreaterThanOrEqual(400);
    }, 10000);

    it(`handles shared scope 429s without counting as invalid requests`, async () => {
      const guildId = `123456789`;

      server.use(
        http.get(
          `https://discord.com/api/v10/guilds/${guildId}/channels`,
          () => {
            return HttpResponse.json(
              {
                message: `The resource is being rate limited.`,
                retry_after: 0.1,
                global: false
              },
              {
                status: 429,
                headers: {
                  "Retry-After": `0.1`,
                  "X-RateLimit-Limit": `10`,
                  "X-RateLimit-Remaining": `9`,
                  "X-RateLimit-Reset": String(Date.now() / 1000 + 0.1),
                  "X-RateLimit-Reset-After": `0.1`,
                  "X-RateLimit-Bucket": `guild-channels`,
                  "X-RateLimit-Scope": `shared`
                }
              }
            );
          }
        )
      );

      const session = new DiscordSession(`Bot test-token`);

      // Shared scope 429s will retry up to max retries, then return the 429
      const response = await session.queueRequest(
        new URL(`https://discord.com/api/v10/guilds/${guildId}/channels`),
        `GET`
      );

      // After max retries, we get back the 429
      expect(response.status).toBe(429);
      // The important part: this didn't throw or hang
    }, 10000);

    it(`processes requests in FIFO order`, async () => {
      const results: number[] = [];

      server.use(
        http.get(`https://discord.com/api/v10/test/:id`, ({ params }) => {
          const id = Number(params.id);
          results.push(id);

          return HttpResponse.json(
            { id },
            {
              headers: {
                "X-RateLimit-Limit": `50`,
                "X-RateLimit-Remaining": `49`,
                "X-RateLimit-Reset": String(Date.now() / 1000 + 1),
                "X-RateLimit-Reset-After": `1`,
                "X-RateLimit-Bucket": `test`
              }
            }
          );
        })
      );

      const session = new DiscordSession(`Bot test-token`);

      // Queue 10 requests
      const promises = Array.from({ length: 10 }, async (_, i) =>
        session.queueRequest(
          new URL(`https://discord.com/api/v10/test/${i}`),
          `GET`
        )
      );

      await Promise.all(promises);

      // Results should be in order
      expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it(`provides queue size monitoring`, async () => {
      let resolveRequest: () => void = () => {};

      server.use(
        http.get(`https://discord.com/api/v10/test`, async () => {
          return new Promise((resolve) => {
            resolveRequest = () => {
              resolve(
                HttpResponse.json(
                  { success: true },
                  {
                    headers: {
                      "X-RateLimit-Limit": `50`,
                      "X-RateLimit-Remaining": `49`,
                      "X-RateLimit-Reset": String(Date.now() / 1000 + 1),
                      "X-RateLimit-Reset-After": `1`,
                      "X-RateLimit-Bucket": `test`
                    }
                  }
                )
              );
            };
          });
        })
      );

      const session = new DiscordSession(`Bot test-token`);

      expect(session.getQueueSize()).toBe(0);

      // Queue multiple requests
      const promise1 = session.queueRequest(
        new URL(`https://discord.com/api/v10/test`),
        `GET`
      );

      // Give the queue processor time to pick up the first request
      await new Promise((resolve) => setTimeout(resolve, 10));

      const promise2 = session.queueRequest(
        new URL(`https://discord.com/api/v10/test`),
        `GET`
      );
      const promise3 = session.queueRequest(
        new URL(`https://discord.com/api/v10/test`),
        `GET`
      );

      // First request is being processed, 2 are queued
      expect(session.getQueueSize()).toBe(2);

      // Resolve first request
      resolveRequest();
      await promise1;

      // Give processor time to move to next request
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(session.getQueueSize()).toBe(1);

      // Resolve remaining
      resolveRequest();
      await promise2;
      await new Promise((resolve) => setTimeout(resolve, 10));

      resolveRequest();
      await promise3;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(session.getQueueSize()).toBe(0);
    });

    it(`handles 204 No Content responses`, async () => {
      const webhookId = `123456789`;
      const webhookToken = `webhook-token`;

      server.use(
        http.post(
          `https://discord.com/api/v10/webhooks/${webhookId}/${webhookToken}`,
          () => {
            return new HttpResponse(null, {
              status: 204,
              headers: {
                "X-RateLimit-Limit": `5`,
                "X-RateLimit-Remaining": `4`,
                "X-RateLimit-Reset": String(Date.now() / 1000 + 1),
                "X-RateLimit-Reset-After": `1`,
                "X-RateLimit-Bucket": `webhook`
              }
            });
          }
        )
      );

      const session = new DiscordSession(`Bot test-token`);

      const response = await session.queueRequest(
        new URL(
          `https://discord.com/api/v10/webhooks/${webhookId}/${webhookToken}`
        ),
        `POST`,
        JSON.stringify({ content: `Test message` })
      );

      expect(response.status).toBe(204);
    });

    it(`clears rate limit state when session is cleared`, () => {
      const session = new DiscordSession(`Bot test-token`);

      // Queue some requests
      void session.queueRequest(
        new URL(`https://discord.com/api/v10/test`),
        `GET`
      );

      expect(session.getQueueSize()).toBeGreaterThan(0);

      // Clear session
      session.clearSession();

      expect(session.getQueueSize()).toBe(0);
      expect(session.ready).toBe(false);
    });
  });

  // Discord limits each route separately, and within a route it counts each
  // channel, guild and webhook separately. Interaction endpoints sit outside
  // the global limit. https://discord.com/developers/docs/topics/rate-limits
  describe(`rate limit buckets`, () => {
    const api = (path: string): URL =>
      new URL(`https://discord.com/api/v10${path}`);

    const rateLimited = (retryAfter: number, scope: `user` | `global`) =>
      HttpResponse.json(
        {
          message: `You are being rate limited.`,
          retry_after: retryAfter,
          global: scope === `global`
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Scope": scope,
            ...(scope === `global` ? { "X-RateLimit-Global": `true` } : {})
          }
        }
      );

    /** A promise the test resolves by hand, to mark or hold a moment. */
    const signal = (): { promise: Promise<void>; resolve: () => void } => {
      let settle: () => void = () => {};
      const promise = new Promise<void>((resolve) => {
        settle = resolve;
      });
      return { promise, resolve: settle };
    };

    it(`answers an interaction while another route waits out a 429`, async () => {
      // WHY: Discord voids an interaction that is not answered within 3
      // seconds, and the user sees "This interaction failed". A 429 on some
      // other route must not hold the reply back for its Retry-After.
      const limited = signal();
      server.use(
        http.post(
          `https://discord.com/api/v10/channels/1/messages`,
          () => {
            limited.resolve();
            return rateLimited(1, `user`);
          },
          { once: true }
        ),
        http.post(`https://discord.com/api/v10/channels/1/messages`, () =>
          HttpResponse.json({ id: `1` })
        ),
        http.post(
          `https://discord.com/api/v10/interactions/:id/:token/callback`,
          () => new HttpResponse(null, { status: 204 })
        )
      );
      const session = new DiscordSession(`Bot test-token`);

      let messageSettled = false;
      const message = (async () => {
        await session.queueRequest(api(`/channels/1/messages`), `POST`, `{}`);
        messageSettled = true;
      })();
      await limited.promise;

      const reply = await session.queueRequest(
        api(`/interactions/2/interaction-token/callback`),
        `POST`,
        `{}`,
        { anonymous: true }
      );

      expect(reply.status).toBe(204);
      expect(messageSettled).toBe(false);
      await message;
    }, 10000);

    it(`does not hold one channel's requests behind another channel's 429`, async () => {
      // WHY: `channel_id` is a major parameter, so Discord counts each
      // channel on its own. A busy channel must not slow a quiet one.
      const limited = signal();
      server.use(
        http.post(
          `https://discord.com/api/v10/channels/1/messages`,
          () => {
            limited.resolve();
            return rateLimited(1, `user`);
          },
          { once: true }
        ),
        http.post(`https://discord.com/api/v10/channels/:id/messages`, () =>
          HttpResponse.json({ id: `1` })
        )
      );
      const session = new DiscordSession(`Bot test-token`);

      let busySettled = false;
      const busy = (async () => {
        await session.queueRequest(api(`/channels/1/messages`), `POST`, `{}`);
        busySettled = true;
      })();
      await limited.promise;

      const quiet = await session.queueRequest(
        api(`/channels/2/messages`),
        `POST`,
        `{}`
      );

      expect(quiet.status).toBe(200);
      expect(busySettled).toBe(false);
      await busy;
    }, 10000);

    it(`sends requests on one route one at a time, in the order they were made`, async () => {
      // WHY: two messages sent to one channel must post in the order the bot
      // sent them, and Discord's per-route count is only known once the
      // previous response arrives.
      const arrived: string[] = [];
      const firstHeld = signal();
      server.use(
        http.post(
          `https://discord.com/api/v10/channels/1/messages`,
          async ({ request }) => {
            const { content } = (await request.json()) as { content: string };
            arrived.push(content);
            if (content === `first`) await firstHeld.promise;
            return HttpResponse.json({ id: content });
          }
        )
      );
      const session = new DiscordSession(`Bot test-token`);

      const sends = [`first`, `second`, `third`].map(async (content) =>
        session.queueRequest(
          api(`/channels/1/messages`),
          `POST`,
          JSON.stringify({ content })
        )
      );
      await sleep(50);

      expect(arrived).toEqual([`first`]);
      firstHeld.resolve();
      await Promise.all(sends);
      expect(arrived).toEqual([`first`, `second`, `third`]);
    });

    it(`holds every route during a global 429, except interaction replies`, async () => {
      // WHY: a global 429 means the bot as a whole is over its limit, and
      // every further request would earn another 429, each one counting
      // toward Cloudflare's ban. Interaction endpoints are outside the global
      // limit, so replies must still go out inside their 3 seconds.
      const limited = signal();
      let otherHits = 0;
      server.use(
        http.get(
          `https://discord.com/api/v10/users/@me`,
          () => {
            limited.resolve();
            return rateLimited(1, `global`);
          },
          { once: true }
        ),
        http.get(`https://discord.com/api/v10/users/@me`, () =>
          HttpResponse.json({ id: `1` })
        ),
        http.get(`https://discord.com/api/v10/channels/1`, () => {
          otherHits++;
          return HttpResponse.json({ id: `1` });
        }),
        http.post(
          `https://discord.com/api/v10/interactions/:id/:token/callback`,
          () => new HttpResponse(null, { status: 204 })
        )
      );
      const session = new DiscordSession(`Bot test-token`);

      const me = session.queueRequest(api(`/users/@me`), `GET`);
      await limited.promise;
      // Let the session read the 429 before the next requests are queued.
      await sleep(50);

      const started = Date.now();
      const other = session.queueRequest(api(`/channels/1`), `GET`);
      const reply = await session.queueRequest(
        api(`/interactions/2/interaction-token/callback`),
        `POST`,
        `{}`,
        { anonymous: true }
      );

      expect(reply.status).toBe(204);
      expect(Date.now() - started).toBeLessThan(500);
      expect(otherHits).toBe(0);
      await Promise.all([me, other]);
      expect(otherHits).toBe(1);
    }, 10000);

    it(`keeps to 50 requests a second when they are spread over many routes`, async () => {
      // WHY: the global limit counts every request the bot makes, whatever
      // the route. Queues that run side by side must share one count, or a
      // burst across many channels goes straight past it.
      server.use(
        http.get(`https://discord.com/api/v10/channels/:id`, () =>
          HttpResponse.json({ id: `1` })
        )
      );
      const session = new DiscordSession(`Bot test-token`);
      const started = Date.now();

      await Promise.all(
        Array.from({ length: 60 }, async (_, i) =>
          session.queueRequest(api(`/channels/${i}`), `GET`)
        )
      );

      expect(Date.now() - started).toBeGreaterThanOrEqual(900);
    });

    it(`does not hold interaction replies when 50 other requests filled the last second`, async () => {
      // WHY: a class pressing buttons at once is a burst of interactions on
      // top of the bot's other traffic. Replies are outside the global limit,
      // so a full one-second window must not delay them past 3 seconds.
      server.use(
        http.get(`https://discord.com/api/v10/channels/:id`, () =>
          HttpResponse.json({ id: `1` })
        ),
        http.post(
          `https://discord.com/api/v10/interactions/:id/:token/callback`,
          () => new HttpResponse(null, { status: 204 })
        )
      );
      const session = new DiscordSession(`Bot test-token`);
      await Promise.all(
        Array.from({ length: 50 }, async (_, i) =>
          session.queueRequest(api(`/channels/${i}`), `GET`)
        )
      );

      const started = Date.now();
      const waiting = session.queueRequest(api(`/channels/50`), `GET`);
      const reply = await session.queueRequest(
        api(`/interactions/2/interaction-token/callback`),
        `POST`,
        `{}`,
        { anonymous: true }
      );

      expect(reply.status).toBe(204);
      expect(Date.now() - started).toBeLessThan(500);
      await waiting;
    });

    describe(`known limits`, () => {
      const bucketHeaders = (bucket: string, remaining: number) => ({
        "X-RateLimit-Bucket": bucket,
        "X-RateLimit-Limit": `1`,
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(Date.now() / 1000 + 0.5),
        "X-RateLimit-Reset-After": `0.5`
      });

      it(`waits for an empty bucket to reset rather than send into a 429`, async () => {
        // WHY: every 429 counts toward Discord's limit of 10,000 invalid
        // requests in 10 minutes, after which Cloudflare bans the bot's IP.
        // When a response says the bucket is empty, the next request on that
        // route must wait for the reset instead of spending one.
        let resetAt = 0;
        let rejected = 0;
        server.use(
          http.get(`https://discord.com/api/v10/channels/1/messages`, () => {
            if (Date.now() < resetAt) {
              rejected++;
              return rateLimited(0.5, `user`);
            }
            resetAt = Date.now() + 500;
            return HttpResponse.json([], { headers: bucketHeaders(`abc`, 0) });
          })
        );
        const session = new DiscordSession(`Bot test-token`);

        await Promise.all([
          session.queueRequest(api(`/channels/1/messages`), `GET`),
          session.queueRequest(api(`/channels/1/messages`), `GET`)
        ]);

        expect(rejected).toBe(0);
      });

      it(`waits on a bucket another route emptied, when Discord says they share it`, async () => {
        // WHY: Discord limits some sets of routes together, and says so by
        // sending the same X-RateLimit-Bucket hash for each. A limit kept per
        // route would miss that and send into a 429.
        let resetAt = 0;
        let rejected = 0;
        const shared = ({ request }: { request: Request }) => {
          if (Date.now() < resetAt) {
            rejected++;
            return rateLimited(0.5, `user`);
          }
          // Only the messages route empties the shared bucket.
          const empty = new URL(request.url).pathname.endsWith(`/messages`);
          if (empty) resetAt = Date.now() + 500;
          return HttpResponse.json([], {
            headers: bucketHeaders(`shared`, empty ? 0 : 1)
          });
        };
        server.use(
          http.get(`https://discord.com/api/v10/channels/1/messages`, shared),
          http.get(`https://discord.com/api/v10/channels/1/pins`, shared)
        );
        const session = new DiscordSession(`Bot test-token`);

        // The session learns that both routes report the same bucket
        await session.queueRequest(api(`/channels/1/pins`), `GET`);
        await session.queueRequest(api(`/channels/1/messages`), `GET`);
        await session.queueRequest(api(`/channels/1/pins`), `GET`);

        expect(rejected).toBe(0);
      });

      it(`does not hold one channel because the same bucket is empty in another`, async () => {
        // WHY: the bucket hash is the same for every channel, but Discord
        // counts each channel on its own. Waiting on another channel's count
        // would slow the bot for no reason.
        server.use(
          http.get(`https://discord.com/api/v10/channels/:id/messages`, () =>
            HttpResponse.json([], {
              headers: {
                ...bucketHeaders(`abc`, 0),
                "X-RateLimit-Reset-After": `1`
              }
            })
          )
        );
        const session = new DiscordSession(`Bot test-token`);
        await session.queueRequest(api(`/channels/1/messages`), `GET`);

        const started = Date.now();
        await session.queueRequest(api(`/channels/2/messages`), `GET`);

        expect(Date.now() - started).toBeLessThan(500);
      });
    });
  });

  // These guard the central invariant of `asUser`/per-request tokens: the
  // Authorization header a request sends is the one captured at ENQUEUE time,
  // and it travels with the request unchanged — across retries, and regardless
  // of what a concurrent caller (or the `using` dispose / request() restore)
  // does to the active token afterwards. A regression here would silently send
  // one user's request with another user's (or the bot's) bearer token.
  describe(`per-request token isolation`, () => {
    it(`retries a rate-limited request with the SAME token it was issued with — even if another caller changes the active token during the retry gap`, async () => {
      const sentAuth: (string | null)[] = [];
      let attempts = 0;
      // Gate that keeps an "intruder" request's `request()` scope OPEN — i.e.
      // holds `#activeToken` set to the intruder's token — across the window in
      // which the first request's retry fires.
      let releaseIntruder: () => void = () => {};
      const intruderGate = new Promise<void>((resolve) => {
        releaseIntruder = resolve;
      });

      server.use(
        http.get(`https://discord.com/api/v10/users/@me`, ({ request }) => {
          attempts++;
          sentAuth.push(request.headers.get(`authorization`));
          // First attempt is rate-limited; the retry must reuse the same token.
          if (attempts === 1) {
            return HttpResponse.json(
              { message: `rate limited`, retry_after: 0.2, global: false },
              {
                status: 429,
                headers: {
                  "Retry-After": `0.2`,
                  "X-RateLimit-Scope": `user`
                }
              }
            );
          }
          return HttpResponse.json({ id: `1` });
        }),
        // A second route the intruder hits; held open by the gate so the
        // intruder's `request()` scope (and thus its active token) stays live.
        http.get(`https://discord.com/api/v10/intruder`, async () => {
          await intruderGate;
          return HttpResponse.json({ ok: true });
        })
      );

      // The session (bot) token is DIFFERENT from the user token, so a leak
      // would be unmistakable in `sentAuth`.
      const session = new DiscordSession(`Bot bot-session-token`);

      const user = session.asUser(`user-access-token`);
      const inflight = user.request(async () =>
        session.queueRequest(
          new URL(`https://discord.com/api/v10/users/@me`),
          `GET`
        )
      );

      // Start a concurrent intruder request whose `request()` scope sets
      // `#activeToken = intruder` and STAYS OPEN (gated). Its presence means
      // that during the first request's Retry-After wait, the live active token
      // is the intruder's — so a live-read on retry would send the wrong token.
      const intruder = session.asUser(`intruder-token`);
      const intruderInflight = intruder.request(async () =>
        session.queueRequest(
          new URL(`https://discord.com/api/v10/intruder`),
          `GET`
        )
      );

      // Let the first request 429 and enter its retry wait while the intruder
      // token is active, then release the intruder and await both.
      await sleep(120);
      releaseIntruder();
      const [response] = await Promise.all([inflight, intruderInflight]);
      intruder[Symbol.dispose]();
      user[Symbol.dispose]();

      expect(response.status).toBe(200);
      expect(attempts).toBe(2);
      // Both the initial attempt AND the retry used the user's bearer token —
      // never the bot session token, and never the intruder's token.
      expect(sentAuth).toEqual([
        `Bearer user-access-token`,
        `Bearer user-access-token`
      ]);
    }, 10000);

    it(`keeps each concurrent user's token isolated across the shared queue`, async () => {
      // Map the auth header each request arrived with, keyed by a per-user
      // path, so overlapping requests can't be confused.
      const seen = new Map<string, string | null>();

      server.use(
        http.get(
          `https://discord.com/api/v10/users/:id/profile`,
          ({ request, params }) => {
            seen.set(String(params.id), request.headers.get(`authorization`));
            return HttpResponse.json({ id: params.id });
          }
        )
      );

      const session = new DiscordSession(`Bot bot-session-token`);

      // Enqueue two user-scoped requests that overlap on the single queue.
      // Each `asUser().request()` enqueues synchronously (capturing its token)
      // before yielding, so the two captures must not interfere.
      using alice = session.asUser(`alice-token`);
      using bob = session.asUser(`bob-token`);

      await Promise.all([
        alice.request(async () =>
          session.queueRequest(
            new URL(`https://discord.com/api/v10/users/alice/profile`),
            `GET`
          )
        ),
        bob.request(async () =>
          session.queueRequest(
            new URL(`https://discord.com/api/v10/users/bob/profile`),
            `GET`
          )
        )
      ]);

      expect(seen.get(`alice`)).toBe(`Bearer alice-token`);
      expect(seen.get(`bob`)).toBe(`Bearer bob-token`);
    });

    it(`falls back to the session token when no active token is set`, async () => {
      let sentAuth: string | null = null;

      server.use(
        http.get(`https://discord.com/api/v10/users/@me`, ({ request }) => {
          sentAuth = request.headers.get(`authorization`);
          return HttpResponse.json({ id: `1` });
        })
      );

      const session = new DiscordSession(`Bot bot-session-token`);

      await session.queueRequest(
        new URL(`https://discord.com/api/v10/users/@me`),
        `GET`
      );

      expect(sentAuth).toBe(`Bot bot-session-token`);
    });
  });
});
