import {
  bridgeMetaName,
  bridgeRoutes,
  fileEvent,
  type BridgeError,
  type FileSnapshot,
  type RenderStatus,
  type SaveResult
} from "../../bridge/protocol.js";
import type { Backend } from "./backend.js";

/** Whether the page was served by the `studio` command with a file: the bridge marks the page it serves. */
export const hasBridge = (): boolean =>
  document.querySelector(`meta[name="${bridgeMetaName}"]`) !== null;

const messageOf = async (response: Response): Promise<string> => {
  try {
    const body: Partial<BridgeError> = await response.json();
    return (
      body.error?.message ?? `The server answered ${String(response.status)}.`
    );
  } catch {
    return `The server answered ${String(response.status)}.`;
  }
};

/** The file on disk, through the bridge. Every URL is relative to the page, whose address carries the run's secret. */
export const bridgeBackend = (): Backend => ({
  kind: `file`,
  load: async () => {
    const response = await fetch(bridgeRoutes.file, { cache: `no-store` });
    if (!response.ok) throw new Error(await messageOf(response));
    // The bridge is this package's own server, speaking `protocol.ts`; its answers are taken as typed.
    const snapshot: FileSnapshot = await response.json();
    return snapshot;
  },
  save: async (text, baseVersion) => {
    const response = await fetch(bridgeRoutes.file, {
      method: `PUT`,
      headers: { "Content-Type": `application/json` },
      body: JSON.stringify({ text, baseVersion })
    });
    if (response.status === 200 || response.status === 409) {
      const result: SaveResult = await response.json();
      return result;
    }
    throw new Error(await messageOf(response));
  },
  subscribe: (onChange, onConnection) => {
    const source = new EventSource(bridgeRoutes.events);
    source.addEventListener(fileEvent, (event: MessageEvent<string>) => {
      const snapshot: FileSnapshot = JSON.parse(event.data);
      onChange(snapshot);
    });
    source.addEventListener(`open`, () => onConnection(true));
    // EventSource reconnects by itself; this only reports the gap.
    source.addEventListener(`error`, () => onConnection(false));
    return () => source.close();
  },
  attachmentUrl: (name) =>
    `${bridgeRoutes.attachments}${encodeURIComponent(name)}`,
  emojiUrl: (fileName) => `${bridgeRoutes.emoji}${fileName}`,
  renderStatus: async () => {
    const response = await fetch(bridgeRoutes.render, { cache: `no-store` });
    if (!response.ok) {
      return { available: false, reason: await messageOf(response) };
    }
    const status: RenderStatus = await response.json();
    return status;
  },
  renderPng: async (request) => {
    const response = await fetch(bridgeRoutes.render, {
      method: `POST`,
      headers: { "Content-Type": `application/json` },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error(await messageOf(response));
    return response.blob();
  },
  checkAttachment: async (name) => {
    try {
      const response = await fetch(
        `${bridgeRoutes.attachments}${encodeURIComponent(name)}`,
        { cache: `no-store` }
      );
      if (!response.ok) {
        return { served: false, reason: await messageOf(response) };
      }
      return {
        served: true,
        type: response.headers.get(`content-type`) ?? `unknown type`,
        bytes: (await response.arrayBuffer()).byteLength
      };
    } catch (error) {
      return {
        served: false,
        reason: `Studio could not ask the studio command: ${error instanceof Error ? error.message : String(error)}. It may have stopped; start it again.`
      };
    }
  }
});
