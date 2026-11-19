import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { asInteger } from "@discordkit/core/validations/asInteger";
import { channelFlag, ChannelFlags } from "../ChannelFlags.js";

describe(`channelFlag`, () => {
  it.each([
    [`CHANNEL_OBFUSCATED`, ChannelFlags.CHANNEL_OBFUSCATED],
    [`IS_SPOILER_CHANNEL`, ChannelFlags.IS_SPOILER_CHANNEL]
  ])(`accepts a channel with %s set`, (_name, flag) => {
    // Channel obfuscation is live for every bot: the Gateway now sends channels the bot cannot view with this flag set. The bitfield validator rejects bits the enum does not name, so without it those channels fail to parse.
    expect(v.safeParse(asInteger(channelFlag), flag).success).toBe(true);
  });
});
