import { nonEmpty, object, pipe, safeParse, string, summarize } from "valibot";
import {
  discord,
  listActiveGuildThreads,
  ChannelType,
  getChannelMessages
} from "@discordkit/client";
import "dotenv/config";

const isRequired = `must be a string`;
const isEmpty = `must not be empty`;

const env = safeParse(
  object(
    {
      BOT_TOKEN: pipe(string(isRequired), nonEmpty(isEmpty)),
      GUILD_ID: pipe(string(isRequired), nonEmpty(isEmpty)),
      CHANNEL_ID: pipe(string(isRequired), nonEmpty(isEmpty))
    },
    (issue) => `Required environment variable ${issue.expected} is missing!`
  ),
  process.env
);

if (env.issues) {
  throw new Error(summarize(env.issues));
}

const fetchRecentThreads = async () => {
  discord.setToken(`Bot ${env.output.BOT_TOKEN}`);
  const guild = env.output.GUILD_ID;
  const channel = env.output.CHANNEL_ID;
  const { threads } = await listActiveGuildThreads({ guild });
  return (
    await Promise.all(
      threads
        .filter(
          (thread) =>
            thread.type === ChannelType.PUBLIC_THREAD &&
            thread.parentId === channel
        )
        .map(async (thread) =>
          Promise.resolve(
            Object.assign(thread, {
              messages: await getChannelMessages({ channel: thread.id })
            })
          )
        )
    )
  ).flat();
};

await fetchRecentThreads(); //?
