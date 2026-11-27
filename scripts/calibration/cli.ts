/**
 * The calibration kit's command line: maintainer tooling for checking `@discordkit/preview` against the real Discord client (spec §7, "Calibration"). Not part of any published package.
 *
 *   post [--send] [--tier <t>] [--only 1,3-5]  Print what posting a tier sends (the default), or post it with --send
 *   delete [--manifest <file>]                 Delete the messages a manifest lists (default: the newest with any left), and nothing else
 *   ingest <folder> [--dest <dir>]             File screenshots into the ignored reference folder, with an index
 *   scenes [--out <dir>] [--tier <t>]          Write each fixture as a scene file the preview command line can draw
 *   instructions [--check | --tier <t>]        Write CAPTURE.md from the capture set, check it is current, or print one tier's checklists
 *
 * A tier is `essential` (the default), `extended`, `markdown` or `all`; `--only` picks fixtures by number instead.
 *
 * Secrets come only from the environment: DISCORD_CALIBRATION_BOT_TOKEN, DISCORD_CALIBRATION_WEBHOOK_URL and DISCORD_CALIBRATION_CHANNEL_ID. They are never printed, written or taken as arguments.
 *
 * Run through the root tasks: `vp run calibration:post`, and so on. It runs on Node's type stripping, like the other scripts, and reads the workspace packages' built `dist/`, so build first (`vp run build`).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { parseTier, selectFixtures, tiers } from "./captureSet.ts";
import {
  createDiscordClient,
  parseWebhookUrl,
  type Credentials
} from "./discord.ts";
import { ingestScreenshots } from "./ingest.ts";
import {
  instructionsPath,
  renderInstructions,
  renderTierChecklists
} from "./instructions.ts";
import {
  fileStamp,
  latestManifest,
  manifestFolder,
  readManifest,
  repositoryRoot,
  requireIgnored,
  shown
} from "./local.ts";
import { deletePosted, formatPlan, postCaptureSet } from "./post.ts";
import { writeScenes } from "./scenes.ts";

const print = (line: string): void => {
  process.stdout.write(`${line}\n`);
};
const warn = (line: string): void => {
  process.stderr.write(`${line}\n`);
};

const guide = `scripts/calibration/CAPTURE.md`;

/** The secrets, from the environment only. Empty values count as unset. */
const readCredentials = (env: NodeJS.ProcessEnv): Credentials => {
  const token = env.DISCORD_CALIBRATION_BOT_TOKEN?.trim() ?? ``;
  const webhookUrl = env.DISCORD_CALIBRATION_WEBHOOK_URL?.trim() ?? ``;
  return {
    botToken: token === `` ? null : token,
    webhook: webhookUrl === `` ? null : parseWebhookUrl(webhookUrl)
  };
};

const requireChannel = (env: NodeJS.ProcessEnv): string => {
  const channel = env.DISCORD_CALIBRATION_CHANNEL_ID?.trim() ?? ``;
  if (channel === ``) {
    throw new Error(
      `DISCORD_CALIBRATION_CHANNEL_ID is not set, so the kit does not know which channel to post to. It is the test channel's id: in Discord, turn on Developer Mode (User Settings, Advanced), right-click the channel and choose Copy Channel ID. Then set it in this terminal, in PowerShell with \`$env:DISCORD_CALIBRATION_CHANNEL_ID = "<the id>"\` or in bash with \`export DISCORD_CALIBRATION_CHANNEL_ID=<the id>\`, and run the command again. ${guide} has every step.`
    );
  }
  if (!/^\d{17,20}$/.test(channel)) {
    throw new Error(
      `DISCORD_CALIBRATION_CHANNEL_ID is set, but not to a channel id: an id is 17 to 20 digits, and this is not. Copy it again with Copy Channel ID (right-click the channel, with Developer Mode on) and set the variable to exactly that.`
    );
  }
  return channel;
};

const requireSender = (credentials: Credentials): void => {
  if (credentials.botToken || credentials.webhook) return;
  throw new Error(
    `Neither DISCORD_CALIBRATION_BOT_TOKEN nor DISCORD_CALIBRATION_WEBHOOK_URL is set, so the kit has nothing to post or delete with. Set the bot's token (from the Developer Portal, your application, Bot, Reset Token) in this terminal without it reaching your shell history: in PowerShell, \`$env:DISCORD_CALIBRATION_BOT_TOKEN = [Net.NetworkCredential]::new('', (Read-Host -AsSecureString 'Bot token')).Password\`; in bash, \`read -rs DISCORD_CALIBRATION_BOT_TOKEN && export DISCORD_CALIBRATION_BOT_TOKEN\`. ${guide} has every step.`
  );
};

const runPost = async (args: string[]): Promise<void> => {
  const { values } = parseArgs({
    args,
    options: {
      send: { type: `boolean`, default: false },
      tier: { type: `string` },
      only: { type: `string` }
    },
    strict: true
  });
  const fixtures = selectFixtures(values.only, parseTier(values.tier));
  const credentials = readCredentials(process.env);
  if (!values.send) {
    // With nothing set, show the whole plan as it would be sent with both.
    const none = !credentials.botToken && !credentials.webhook;
    print(
      formatPlan(fixtures, {
        bot: none || credentials.botToken !== null,
        webhook: none || credentials.webhook !== null
      })
    );
    return;
  }
  const channelId = requireChannel(process.env);
  requireSender(credentials);
  const root = repositoryRoot();
  const manifestPath = join(
    manifestFolder(root),
    `${fileStamp(new Date())}.json`
  );
  requireIgnored(manifestPath, `the manifest of posted messages`);
  warn(
    `Posting ${String(fixtures.length)} fixtures. The manifest is ${shown(manifestPath, root)}.`
  );
  const client = createDiscordClient({
    credentials,
    onWait: (ms, reason) => {
      warn(`  waiting ${(ms / 1000).toFixed(1)}s for ${reason}`);
    }
  });
  const manifest = await postCaptureSet({
    fixtures,
    credentials,
    channelId,
    client,
    manifestPath,
    log: warn
  });
  warn(
    `Posted ${String(manifest.entries.length)} messages. To remove them later: vp run calibration:delete --manifest ${shown(manifestPath, root)}`
  );
};

const runDelete = async (args: string[]): Promise<void> => {
  const { values } = parseArgs({
    args,
    options: { manifest: { type: `string` } },
    strict: true
  });
  const root = repositoryRoot();
  const path = values.manifest ?? latestManifest(manifestFolder(root));
  if (path === null) {
    throw new Error(
      `There is no manifest in ${shown(manifestFolder(root), root)} with messages left to delete, so there is nothing the kit knows it posted and has not removed. The post command writes one there for each run; pass another with --manifest <file>.`
    );
  }
  const credentials = readCredentials(process.env);
  requireSender(credentials);
  const manifest = readManifest(path);
  const remaining = manifest.entries.filter((entry) => !entry.deletedAt).length;
  warn(
    `Deleting the ${String(remaining)} messages ${shown(path, root)} lists that are not deleted yet.`
  );
  const client = createDiscordClient({
    credentials,
    onWait: (ms, reason) => {
      warn(`  waiting ${(ms / 1000).toFixed(1)}s for ${reason}`);
    }
  });
  const deleted = await deletePosted({
    manifest,
    manifestPath: path,
    credentials,
    client,
    log: warn
  });
  warn(`Deleted ${String(deleted)}. Each is marked in the manifest.`);
};

const runIngest = (args: string[]): void => {
  const { values, positionals } = parseArgs({
    args,
    options: { dest: { type: `string` } },
    allowPositionals: true,
    strict: true
  });
  const [source] = positionals;
  if (source === undefined) {
    throw new Error(
      `No folder given, so there are no screenshots to file. Pass the folder you saved them to: \`vp run calibration:ingest <folder>\`.`
    );
  }
  const root = repositoryRoot();
  const dest =
    values.dest ?? join(root, `.discord-reference`, `captures`, `calibration`);
  const result = ingestScreenshots({ source, dest, log: warn });
  for (const { file, reason } of result.skipped)
    warn(`skipped ${file}: ${reason}`);
  warn(
    `Filed ${String(result.added.length)} screenshots. The index is ${shown(result.indexPath, root)}; its platform, fixture and scale fields are for whoever matches them.`
  );
};

const runScenes = (args: string[]): void => {
  const { values } = parseArgs({
    args,
    options: {
      out: { type: `string` },
      tier: { type: `string` },
      only: { type: `string` }
    },
    strict: true
  });
  const root = repositoryRoot();
  const out =
    values.out ?? join(root, `.discord-reference`, `calibration-scenes`);
  const written = writeScenes(
    selectFixtures(values.only, parseTier(values.tier)),
    out
  );
  warn(`Wrote ${String(written.length)} scenes to ${shown(out, root)}.`);
};

const runInstructions = (args: string[]): void => {
  const { values } = parseArgs({
    args,
    options: {
      check: { type: `boolean`, default: false },
      tier: { type: `string` }
    },
    strict: true
  });
  // With a tier, print just that tier's checklists; CAPTURE.md itself holds every tier, essential first.
  if (values.tier !== undefined) {
    const tier = parseTier(values.tier);
    print(
      (tier === `all` ? tiers : [tier])
        .map((each) => renderTierChecklists(each).join(`\n`))
        .join(`\n\n`)
    );
    return;
  }
  const expected = renderInstructions();
  if (values.check) {
    const current = readFileSync(instructionsPath, `utf8`);
    if (current !== expected) {
      throw new Error(
        `${guide} is out of date with the capture set. Run \`vp run calibration:instructions\` to write it again.`
      );
    }
    warn(`${guide} is current.`);
    return;
  }
  writeFileSync(instructionsPath, expected);
  warn(`Wrote ${guide}.`);
};

const commands: Record<string, (args: string[]) => Promise<void> | void> = {
  post: runPost,
  delete: runDelete,
  ingest: runIngest,
  scenes: runScenes,
  instructions: runInstructions
};

const [name, ...rest] = process.argv.slice(2);
const command = name === undefined ? undefined : commands[name];
if (!command) {
  warn(
    `The calibration kit has no command ${name === undefined ? `given` : `called "${name}"`}. Its commands are ${Object.keys(commands).join(`, `)}; run them through the root tasks, such as \`vp run calibration:post\`. ${guide} says what each is for.`
  );
  process.exitCode = 2;
} else {
  try {
    await command(rest);
  } catch (error) {
    warn(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
