import { watch, type FSWatcher } from "node:fs";
import { stat } from "node:fs/promises";
import { basename, dirname } from "node:path";

export interface WatchOptions {
  /** How long to wait after the last event before reporting, so a burst of events from one save is reported once. */
  debounceMs?: number;
  /** How often to compare the file's size and modification time as well, in case the platform's watcher misses an event. */
  pollMs?: number;
}

export interface FileWatcher {
  close: () => void;
}

/** Windows and macOS file systems ignore case by default, so an event for `Scene.json` is about `scene.json` there. */
const sameName = (a: string, b: string): boolean =>
  process.platform === `win32` || process.platform === `darwin`
    ? a.toLowerCase() === b.toLowerCase()
    : a === b;

/**
 * Calls `onChange` soon after the file at `path` may have changed: written, replaced, deleted or created again. It may also call it when nothing changed, so the caller compares content before acting.
 *
 * Built on the platform's own file watching, with three things that make it dependable on Windows, where it is used most:
 *
 * - It watches the directory, not the file. Many editors save by writing a new file and renaming it over the old one, and a watch on the old file stops reporting after that.
 * - It waits for a quiet moment (`debounceMs`) before reporting, because one save often raises several events, some before the content is complete.
 * - It also compares the file's size and modification time every `pollMs`, because a watcher can miss events (network drives, some virtualised file systems) and the browser must still see the change within a second.
 */
export const watchFile = (
  path: string,
  onChange: () => void,
  { debounceMs = 60, pollMs = 750 }: WatchOptions = {}
): FileWatcher => {
  const name = basename(path);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let closed = false;
  const report = (): void => {
    if (closed) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!closed) onChange();
    }, debounceMs);
  };

  let watcher: FSWatcher | undefined;
  try {
    watcher = watch(dirname(path), { persistent: false }, (_, filename) => {
      // Some platforms do not say which file changed; then any event might be ours.
      if (filename === null || sameName(filename, name)) report();
    });
    // The directory itself can go away, which fails the watch on Windows. Polling below still notices the file.
    watcher.on(`error`, () => {
      watcher?.close();
      watcher = undefined;
    });
  } catch {
    watcher = undefined;
  }

  let last = ``;
  const poll = async (): Promise<void> => {
    let stamp: string;
    try {
      const info = await stat(path);
      stamp = `${String(info.size)}:${String(info.mtimeMs)}`;
    } catch {
      stamp = `missing`;
    }
    if (last !== `` && stamp !== last) report();
    last = stamp;
  };
  void poll();
  const interval = setInterval(() => void poll(), pollMs);
  interval.unref();

  return {
    close: () => {
      closed = true;
      clearTimeout(timer);
      clearInterval(interval);
      watcher?.close();
    }
  };
};
