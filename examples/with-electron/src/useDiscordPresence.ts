import { useEffect, useState } from "react";
import type { ActivityInput } from "@discordkit/native/presence";

/**
 * Push `activity` to Discord whenever it changes, DEBOUNCED. Discord rate-limits rapid `UpdateRichPresence` calls (and will empty the presence), so edits are coalesced into one update after `delayMs` of quiet. Returns the last error (if the push failed), or `undefined` on success.
 *
 * Pass `null` to turn presence OFF: the hook clears the activity in Discord (`clearActivity`) instead of pushing one. This makes a presence on/off toggle a pure data concern — the caller passes `enabled ? activity : null` and the effect does the right imperative thing — with no branching in the component.
 *
 * A debounced write-on-change is genuinely effect-shaped (a side effect reacting to a changing value), so this is the correct place for `useEffect` — contained in one hook rather than scattered through the component.
 */
export const useDiscordPresence = (
  activity: ActivityInput | null,
  delayMs = 1000
): { error: string | undefined } => {
  const [error, setError] = useState<string>();

  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        try {
          if (activity) await window.discord.setActivity(activity);
          else await window.discord.clearActivity();
          setError(undefined);
        } catch (e) {
          setError(String(e));
        }
      })();
    }, delayMs);
    return () => clearTimeout(timer);
  }, [activity, delayMs]);

  return { error };
};
