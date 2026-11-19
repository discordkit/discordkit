---
"@discordkit/oauth": minor
---

The callback handler now checks the `iss` parameter Discord adds to every authorization response ([RFC 9207](https://www.rfc-editor.org/info/rfc9207)).

`createAuthHandler`'s `callback` rejects a response whose `iss` is not `https://discord.com` with a 400, before the code is exchanged. This is the defence against authorization server mix-up, where a response from another OAuth2 provider is passed off as Discord's. A response with no `iss` is rejected as well, since a hostile server would simply leave it out.

Real Discord redirects have carried `iss` since October 6, 2026, so production flows are unaffected. **If you test against a stand-in for Discord, add `iss=https://discord.com` to the redirect it sends back**, or the callback will return 400.

`DISCORD_ISSUER` is exported for apps that handle the callback themselves with `createOAuth2`.
