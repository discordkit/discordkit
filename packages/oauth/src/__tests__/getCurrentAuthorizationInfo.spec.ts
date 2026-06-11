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
import { getCurrentAuthorizationInfo } from "../getCurrentAuthorizationInfo.js";

const server = setupServer();

const AUTH_INFO_URL = `https://discord.com/api/oauth2/@me`;

describe(`getCurrentAuthorizationInfo`, () => {
  beforeAll(() => server.listen({ onUnhandledRequest: `error` }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it(`sends the bearer token and returns the parsed info`, async () => {
    let sentAuth: string | null = null;
    server.use(
      http.get(AUTH_INFO_URL, ({ request }) => {
        sentAuth = request.headers.get(`authorization`);
        return HttpResponse.json({
          application: { id: `1`, name: `App`, icon: null, description: `` },
          scopes: [`identify`, `email`],
          expires: `2026-07-01T00:00:00.000Z`,
          user: { id: `2`, username: `n`, discriminator: `0`, avatar: null }
        });
      })
    );

    const info = await getCurrentAuthorizationInfo(`the-token`);

    // WHY: this endpoint authenticates with the *user's* bearer token passed
    // in directly — not the bot session — so the header must carry it.
    expect(sentAuth).toBe(`Bearer the-token`);
    expect(info.scopes).toEqual([`identify`, `email`]);
    expect(info.user?.username).toBe(`n`);
  });

  it(`omits user when the identify scope wasn't granted`, async () => {
    // WHY: Discord only includes `user` when `identify` is authorized; we must
    // not synthesize an empty user object when it's absent.
    server.use(
      http.get(AUTH_INFO_URL, () =>
        HttpResponse.json({
          application: { id: `1`, name: `App`, icon: null, description: `` },
          scopes: [`guilds`],
          expires: `2026-07-01T00:00:00.000Z`
        })
      )
    );
    const info = await getCurrentAuthorizationInfo(`t`);
    expect(info).not.toHaveProperty(`user`);
  });

  it(`throws an actionable error on an expired/invalid token`, async () => {
    server.use(
      http.get(AUTH_INFO_URL, () =>
        HttpResponse.text(`401: Unauthorized`, { status: 401 })
      )
    );
    await expect(getCurrentAuthorizationInfo(`bad`)).rejects.toThrow(
      /expired or invalid/
    );
  });
});
