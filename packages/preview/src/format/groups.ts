import type { SceneMessage } from "../scene.js";

/** Consecutive messages from the same author within this long of each other share one header. The client decides this in JavaScript; unverified. */
const groupWindow = 7 * 60 * 1000;

const sentAt = (message: SceneMessage, now: number, index: number): number => {
  if (message.timestamp === undefined) return now;
  const ms = Date.parse(message.timestamp);
  if (Number.isNaN(ms)) {
    throw new Error(
      `@discordkit/preview could not read message ${String(index + 1)}'s \`timestamp\` (${JSON.stringify(message.timestamp)}) as a date. It is when the message was sent, which the header shows and which decides whether the message shares a header with the one above. Write it as an ISO 8601 date-time like "2026-11-25T16:05:00Z", or leave it out to use the scene's \`now\`.`
    );
  }
  return ms;
};

/** When each message was sent, in milliseconds since the epoch: its `timestamp`, or the scene's clock. Throws for a timestamp that is not a date, naming the message. */
export const sentTimes = (
  messages: readonly SceneMessage[],
  now: number
): number[] => messages.map((message, index) => sentAt(message, now, index));

/** Whether each message starts a group, drawn with the avatar and header, rather than continuing the one above: a different author, a change between ephemeral and not, or more than seven minutes apart. */
export const groupStarts = (
  messages: readonly SceneMessage[],
  times: readonly number[]
): boolean[] =>
  messages.map((message, index) => {
    const previous = messages.at(index - 1);
    return (
      index === 0 ||
      previous === undefined ||
      previous.author !== message.author ||
      Boolean(previous.ephemeral) !== Boolean(message.ephemeral) ||
      Math.abs(times[index] - times[index - 1]) > groupWindow
    );
  });
