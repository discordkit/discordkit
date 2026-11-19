import { describe, it, expect } from "vite-plus/test";
import { parseResource } from "../parse.ts";

/**
 * Mintlify changed how it renders the docs to `.md` in late 2026. Every tool
 * downstream of `parseResource` — audit, scaffold, the JSDoc differs — keys on
 * endpoints, so a render the parser cannot read does not fail loudly: it
 * reports every endpoint in the codebase as "missing from docs". These specs
 * pin both renders with fixtures copied from the cache.
 */

const LEGACY_RENDER = `
# Channels Resource

## Get Channel Invites

<Route method="GET">/channels/[\\{channel.id}](/developers/resources/channel#channel-object)/invites</Route>

Returns a list of [invite](/developers/resources/invite#invite-object) objects for the channel.
`;

const CURRENT_RENDER = `
# Channels Resource

## Get Channel Invites

GET
/channels/[{channel.id}](https://docs.discord.com/developers/resources/channel.md#channel-object)/invites

Returns a list of [invite](https://docs.discord.com/developers/resources/invite.md#invite-object) objects for the channel.

## Create Channel Invite

POST
/channels/[{channel.id}](https://docs.discord.com/developers/resources/channel.md#channel-object)/invites

Create a new invite for the channel.

###### JSON Params

| Field | Type | Description |
| --- | --- | --- |
| max\\_age | integer | duration of invite in seconds before expiry |
| target\\_user? | [user](https://docs.discord.com/developers/resources/user.md#user-object) object | the user whose stream to display |
`;

describe(`parseResource`, () => {
  it(`reads an endpoint from the current render, which has no <Route>`, () => {
    const [invites] = parseResource(CURRENT_RENDER).endpoints;

    expect(invites?.name).toBe(`Get Channel Invites`);
    expect(invites?.method).toBe(`GET`);
    // The path param survives only if the bare \`{channel.id}\` is escaped
    // before remark-mdx sees it; otherwise it parses as a JS expression and
    // drops out of the route text.
    expect(invites?.path).toBe(`/channels/:channel/invites`);
  });

  it(`reads the two renders identically`, () => {
    // The codebase's JSDoc and filenames were generated from the legacy
    // render. If the current one parsed to anything different, every refresh
    // would rewrite files that have not actually changed.
    const [legacy] = parseResource(LEGACY_RENDER).endpoints;
    const [current] = parseResource(CURRENT_RENDER).endpoints;

    expect(current).toEqual(legacy);
  });

  it(`does not mistake the method line for the endpoint description`, () => {
    const [invites] = parseResource(CURRENT_RENDER).endpoints;

    expect(invites?.description).toMatch(/^Returns a list of/);
  });

  it(`resolves an absolute docs link to the same type reference`, () => {
    // Field types are matched to codebase schemas by reference name. An
    // unrecognised absolute URL would degrade the type to raw text and lose
    // that link.
    const create = parseResource(CURRENT_RENDER).endpoints[1];
    const targetUser = create?.jsonParams
      .flatMap((group) => group.fields)
      .find((field) => field.name === `targetUser`);

    expect(targetUser?.type).toMatchObject({ kind: `ref`, refName: `user` });
  });
});
