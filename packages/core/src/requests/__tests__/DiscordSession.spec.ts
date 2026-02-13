import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { DiscordSession } from "../DiscordSession.js";

const server = setupServer();

describe(`discordSession`, () => {
  beforeAll(() => server.listen({ onUnhandledRequest: `error` }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

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
    });

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
});
