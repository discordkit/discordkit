import { useEffect, useState } from "react";
import { dicebear } from "./samples.js";
import type { FormValues } from "./schema.js";

/** Format elapsed ms as M:SS, like Discord's "X:XX elapsed". */
const elapsed = (sinceMs: number): string => {
  const total = Math.max(0, Math.floor((Date.now() - sinceMs) / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, `0`)} elapsed`;
};

/** Resolve an image sub-form to a URL for the preview (or "" when off/empty). */
const imageUrl = (
  img: FormValues[`activity`][`largeImage`],
  style: string
): string => {
  if (!img.on) return ``;
  return img.source === `sample` ? dicebear(style, img.seed) : img.url;
};

/**
 * A simplified Discord-style "Playing a Game" card mirroring the Developer Portal visualizer's Full Profile preview. This is an approximation for the example — the real rendering happens in the Discord client.
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

  const a = values.activity;
  const details = a.details.on ? a.details.value : ``;
  const state = a.state.on ? a.state.value : ``;
  const party =
    a.party.on && (a.party.currentSize || a.party.maxSize)
      ? ` (${a.party.currentSize} of ${a.party.maxSize})`
      : ``;
  const largeImage = imageUrl(a.largeImage, `shapes`);
  const largeText = a.largeImage.on ? a.largeImage.text : ``;
  const smallImage = imageUrl(a.smallImage, `bottts`);
  const smallText = a.smallImage.on ? a.smallImage.text : ``;
  const buttons = a.buttons.filter((b) => b.label && b.url);

  return (
    <div className="rounded-lg bg-[#5865f2] p-4 text-white">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide opacity-80">
        Playing a Game
      </p>
      <div className="flex gap-3">
        <div className="relative">
          {largeImage ? (
            <img
              src={largeImage}
              alt={largeText}
              className="size-16 rounded-md object-cover"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-md bg-black/30 text-[10px]">
              {largeText || `large`}
            </div>
          )}
          {smallImage ? (
            <img
              src={smallImage}
              alt={smallText}
              className="absolute -bottom-1 -right-1 size-6 rounded-full object-cover ring-2 ring-[#5865f2]"
            />
          ) : smallText ? (
            <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-black/50 text-[8px] ring-2 ring-[#5865f2]">
              S
            </div>
          ) : null}
        </div>
        <div className="min-w-0 text-sm leading-tight">
          <p className="font-semibold">discordkit</p>
          {details ? <p className="truncate">{details}</p> : null}
          {state || party ? (
            <p className="truncate">
              {state}
              {party}
            </p>
          ) : null}
          {a.useTimestamp ? (
            <p className="opacity-80">{elapsed(startedAt)}</p>
          ) : null}
        </div>
      </div>
      {buttons.length ? (
        <div className="mt-3 flex flex-col gap-2">
          {buttons.map((b, i) => (
            <div
              key={i}
              className="rounded bg-white/15 px-3 py-1.5 text-center text-xs"
            >
              {b.label}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
