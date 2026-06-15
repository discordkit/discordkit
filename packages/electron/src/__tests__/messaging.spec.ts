import { describe, it, expect } from "vitest";
import { snowflake } from "@discordkit/native";
import type { MessageId, UserId } from "@discordkit/native";
import { createFakeIpc } from "./fakeIpc.js";
import { stubBackend } from "./stubBackend.js";
import { messagingSlice } from "../preload/messaging.js";
import { bridgeIo } from "../internal.js";
import { registerDiscord, type DiscordMainHandle } from "../main.js";
import { registerMessaging } from "../main/messaging.js";
import { MESSAGE_CHANNELS } from "../channels/messaging.js";

/**
 * The messaging slice is pure wiring: each method maps to one channel and
 * forwards its arg(s); event subscriptions route main→renderer broadcasts. We
 * compose it against a fake ipcMain and assert the user-facing outcome — the
 * resolved value / delivered event — never "an invoke happened".
 */
const setup = () => {
  const ipc = createFakeIpc();
  const io = bridgeIo(ipc.ipcRenderer);
  /** Register a main handler that echoes its args, so we can assert routing. */
  const echo = (channel: string): unknown[][] => {
    const calls: unknown[][] = [];
    ipc.ipcMain.handle(channel, (_e, ...args) => {
      calls.push(args);
      return args[0];
    });
    return calls;
  };
  return { ipc, io, echo };
};

describe(`messaging slice`, () => {
  it(`sendUser forwards recipient + content + metadata and returns the new id`, async () => {
    const { ipc, io } = setup();
    const { messages } = messagingSlice(io);
    ipc.ipcMain.handle(MESSAGE_CHANNELS.sendUser, () => 7777n);

    const id = await messages.sendUser(snowflake<UserId>(11n), `gg`, {
      character: `mage`
    });

    // Why: send must return the new message id (so the caller can getMessage it
    // back); a lost return breaks any read-after-send flow.
    expect(id).toBe(7777n);
  });

  it(`sendUser routes the args in order`, async () => {
    const { io, echo } = setup();
    const { messages } = messagingSlice(io);
    const calls = echo(MESSAGE_CHANNELS.sendUser);

    await messages.sendUser(snowflake<UserId>(11n), `hi`, { team: `blue` });

    // Why: arg order across IPC is positional — a transposed (content, recipient)
    // would send the wrong person the wrong text.
    expect(calls).toEqual([[11n, `hi`, { team: `blue` }]]);
  });

  it(`get / getUserMessages forward their ids and return the reply`, async () => {
    const { ipc, io } = setup();
    const { messages } = messagingSlice(io);
    ipc.ipcMain.handle(MESSAGE_CHANNELS.get, (_e, id) => ({ id }));
    ipc.ipcMain.handle(MESSAGE_CHANNELS.getUserMessages, (_e, recipientId) => [
      { id: 1n, authorId: recipientId }
    ]);

    // Why: reads must forward the id and return the snapshot(s) intact.
    await expect(messages.get(snowflake<MessageId>(7000n))).resolves.toEqual({
      id: 7000n
    });
    await expect(
      messages.getUserMessages(snowflake<UserId>(11n), 25)
    ).resolves.toEqual([{ id: 1n, authorId: 11n }]);
  });

  it(`onCreated delivers the message id and unsubscribes`, () => {
    const { ipc, io } = setup();
    const { messages } = messagingSlice(io);
    const seen: bigint[] = [];
    const off = messages.onCreated((id) => seen.push(id));

    ipc.emit(MESSAGE_CHANNELS.created, 7000n);
    off();
    ipc.emit(MESSAGE_CHANNELS.created, 8000n);

    // Why: the created stream is how a chat UI appends new messages; the
    // unsubscribe must detach or the renderer leaks handlers.
    expect(seen).toEqual([7000n]);
  });

  it(`onDeleted delivers both the message id and its channel id`, () => {
    const { ipc, io } = setup();
    const { messages } = messagingSlice(io);
    const seen: [bigint, bigint][] = [];
    const off = messages.onDeleted((messageId, channelId) =>
      seen.push([messageId, channelId])
    );

    ipc.emit(MESSAGE_CHANNELS.deleted, 7000n, 900n);
    off();

    // Why: a deleted message is gone, so the channel id is the only way to locate
    // where it was — both ids must arrive.
    expect(seen).toEqual([[7000n, 900n]]);
  });
});

describe(`registerMessaging`, () => {
  let handle: DiscordMainHandle | undefined;
  const boot = () => {
    const ipc = createFakeIpc();
    handle = registerDiscord(ipc.ipcMain, {
      applicationId: 123n,
      backend: stubBackend as never,
      targets: [ipc.target]
    });
    return { ipc };
  };

  it(`wires its channels onto the context's ipcMain`, () => {
    const { ipc } = boot();
    // Core alone registers no messaging handler — the domain adds it.
    expect(ipc.ipcMain.channels.has(MESSAGE_CHANNELS.sendUser)).toBe(false);

    registerMessaging(handle!.context);

    // Why: the per-domain registrar is how an app opts into a namespace; given the
    // context it must register that domain's handlers so the bridge can reach them.
    expect(ipc.ipcMain.channels.has(MESSAGE_CHANNELS.sendUser)).toBe(true);
    expect(ipc.ipcMain.channels.has(MESSAGE_CHANNELS.get)).toBe(true);
    expect(ipc.ipcMain.channels.has(MESSAGE_CHANNELS.getSummaries)).toBe(true);
    handle!.dispose();
    handle = undefined;
  });
});
