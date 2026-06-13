import { useEffect, useState } from "react";
import type { FormValues } from "./schema.js";

/** Format elapsed ms as M:SS, like Discord's "X:XX elapsed". */
const elapsed = (sinceMs: number): string => {
  const total = Math.max(0, Math.floor((Date.now() - sinceMs) / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, `0`)} elapsed`;
};

/**
 * A simplified Discord-style "Playing a Game" card mirroring the Developer
 * Portal visualizer's Full Profile preview. This is an approximation for the
 * example — the real rendering happens in the Discord client.
 */
export const PreviewCard = ({
  values,
  startedAt
}: {
  values: FormValues;
  startedAt: number;
}): React.JSX.Element => {
  // Re-render once a second so the elapsed timer ticks.
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const { currentSize, maxSize } = values.party;
  const party = currentSize || maxSize ? ` (${currentSize} of ${maxSize})` : ``;
  const button = values.buttons.find((b) => b.label && b.url);

  return (
    <div className="rounded-lg bg-[#5865f2] p-4 text-white">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide opacity-80">
        Playing a Game
      </p>
      <div className="flex gap-3">
        <div className="relative">
          <div className="flex size-16 items-center justify-center rounded-md bg-black/30 text-[10px]">
            {values.assets.largeText || `large`}
          </div>
          <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-black/50 text-[8px] ring-2 ring-[#5865f2]">
            {values.assets.smallText ? `S` : ``}
          </div>
        </div>
        <div className="min-w-0 text-sm leading-tight">
          <p className="font-semibold">discordkit</p>
          {values.details ? <p className="truncate">{values.details}</p> : null}
          <p className="truncate">
            {values.state}
            {party}
          </p>
          {values.useTimestamp ? (
            <p className="opacity-80">{elapsed(startedAt)}</p>
          ) : null}
        </div>
      </div>
      {button ? (
        <div className="mt-3 rounded bg-white/15 px-3 py-1.5 text-center text-xs">
          {button.label}
        </div>
      ) : null}
    </div>
  );
};
