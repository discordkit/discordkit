// Renderer entry (browser context). Talks to the Discord Social SDK only through
// `window.discord`, the typed bridge the preload exposed via @discordkit/electron.
// No FFI, no Node, no `electron` import here.

import "@discordkit/electron/renderer";
import type { Status } from "@discordkit/electron/renderer";

const $ = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el as T;
};

const statusEl = $<HTMLElement>(`status`);
const logEl = $<HTMLPreElement>(`log`);
const connectBtn = $<HTMLButtonElement>(`connect`);
const setBtn = $<HTMLButtonElement>(`set`);
const clearBtn = $<HTMLButtonElement>(`clear`);

const presenceEnabled = (status: Status): boolean => status === `Ready`;

const render = (status: Status): void => {
  statusEl.textContent = status;
  setBtn.disabled = !presenceEnabled(status);
  clearBtn.disabled = !presenceEnabled(status);
  connectBtn.disabled = status === `Connecting` || status === `Ready`;
};

const appendLog = (line: string): void => {
  logEl.textContent += `${line}\n`;
  logEl.scrollTop = logEl.scrollHeight;
};

// Reflect the live status signal (forwarded from the main process).
window.discord.onStatus(render);
window.discord.onLog(({ severity, message }) =>
  appendLog(`[${severity}] ${message}`)
);

// Seed the current status (covers the case where Ready arrived before we subscribed).
void (async () => {
  render(await window.discord.getStatus());
})();

connectBtn.addEventListener(`click`, () => {
  connectBtn.disabled = true;
  appendLog(`[ui] connecting — a browser window will open for Discord login…`);
  void (async () => {
    try {
      await window.discord.connect({ scopes: `presence` });
    } catch (error) {
      appendLog(`[ui] connect failed: ${String(error)}`);
      connectBtn.disabled = false;
    }
  })();
});

setBtn.addEventListener(`click`, () => {
  void window.discord.setActivity({
    type: `playing`,
    state: `In a match`,
    details: `discordkit Electron demo`
  });
});

clearBtn.addEventListener(`click`, () => {
  void window.discord.clearActivity();
});
