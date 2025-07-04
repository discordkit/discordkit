import * as v from "valibot";

export const envSchema = v.object({
  BOT_TOKEN: v.message(
    v.pipe(v.string(), v.nonEmpty()),
    `Bot token must be set in your ./env.local file!`
  )
});
