import {
  bridgeMetaName,
  bridgeRoutes,
  fileEvent,
  type BridgeError,
  type FileSnapshot,
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
    `${bridgeRoutes.attachments}${encodeURIComponent(name)}`
});
