import { useMemo, type ReactElement } from "react";
import type { Embed as EmbedData } from "@discordkit/client/messages/types/Embed";
import { colorToHex } from "../format/color.js";
import { embedFieldColumns } from "../format/embedFields.js";
import { formatMessageTime } from "../format/timestamp.js";
import { parseMarkdown, type MarkdownContext } from "../markdown/parse.js";
import { Image } from "./Image.js";
import { useInspect } from "./Inspect.js";
import { Markup } from "./Markup.js";
import { useSceneSettings } from "./SceneContext.js";
import styles from "./Embed.module.css";

export interface EmbedProps {
  embed: EmbedData;
  /** Its place among the message's embeds, for error messages. */
  index: number;
}

/** Text from an embed slot, parsed with the rules Discord applies in that slot: a user mention stays literal in a title, a field value has no headings. */
const Text = ({
  source,
  context
}: {
  source: string;
  context: MarkdownContext;
}): ReactElement => <Markup nodes={parseMarkdown(source, context)} />;

const cx = (...names: Array<string | false | undefined>): string =>
  names.filter(Boolean).join(` `);

/** Refuses what an embed can carry but this renderer does not draw, rather than leave it out. */
const refuseUndrawn = (embed: EmbedData, index: number): void => {
  const undrawn = [
    embed.video ? `a video` : ``,
    embed.provider ? `a provider` : ``,
    embed.components && embed.components.length > 0 ? `components` : ``
  ].filter(Boolean);
  if (undrawn.length > 0) {
    throw new Error(
      `@discordkit/preview cannot draw embed ${String(index + 1)} yet: it has ${undrawn.join(` and `)}, which the renderer does not draw, and leaving them out would make the preview look unlike the real message. Apps cannot send these in a rich embed (Discord fills them in for link previews), so remove them from the payload to preview the rest.`
    );
  }
};

/**
 * A classic rich embed: the coloured bar down its leading edge, then author, title, description, fields, image and footer, with the thumbnail in a column of its own beside them.
 */
export const Embed = ({ embed, index }: EmbedProps): ReactElement => {
  const { clock } = useSceneSettings();
  const inspect = useInspect(embed);
  refuseUndrawn(embed, index);
  const hasThumbnail = embed.thumbnail !== undefined;
  const fields = useMemo(() => embed.fields ?? [], [embed.fields]);
  const fieldStyles = useMemo(
    () =>
      embedFieldColumns(fields, hasThumbnail).map((gridColumn) => ({
        gridColumn
      })),
    [fields, hasThumbnail]
  );
  const { color } = embed;
  const barStyle = useMemo(
    () =>
      color === undefined
        ? undefined
        : { borderInlineStartColor: colorToHex(color) },
    [color]
  );
  let time: string | undefined;
  if (embed.timestamp !== undefined) {
    const ms = Date.parse(embed.timestamp);
    if (Number.isNaN(ms)) {
      throw new Error(
        `@discordkit/preview could not read embed ${String(index + 1)}'s \`timestamp\` (${JSON.stringify(embed.timestamp)}) as a date. The footer shows it as a time, so it has to be one. Write it as an ISO 8601 date-time like "2026-11-25T16:05:00Z", or leave it out.`
      );
    }
    time = formatMessageTime(ms, clock);
  }
  const { author, footer } = embed;
  return (
    <article className={styles.embed} style={barStyle} {...inspect}>
      <div className={styles.gridContainer}>
        <div className={cx(styles.grid, hasThumbnail && styles.hasThumbnail)}>
          {author ? (
            <div className={cx(styles.author, styles.embedMargin)}>
              {author.iconUrl ? (
                <Image
                  reference={author.iconUrl}
                  alt=""
                  className={styles.authorIcon}
                />
              ) : null}
              {author.url ? (
                <a
                  className={cx(styles.text, styles.authorName)}
                  href={author.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Text source={author.name} context="embedAuthor" />
                </a>
              ) : (
                <span className={cx(styles.text, styles.authorName)}>
                  <Text source={author.name} context="embedAuthor" />
                </span>
              )}
            </div>
          ) : null}
          {embed.title === undefined ? null : (
            <div className={cx(styles.text, styles.title, styles.embedMargin)}>
              {embed.url ? (
                <a
                  className={styles.titleLink}
                  href={embed.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Text source={embed.title} context="embedTitle" />
                </a>
              ) : (
                <Text source={embed.title} context="embedTitle" />
              )}
            </div>
          )}
          {embed.description === undefined ? null : (
            <div
              className={cx(
                styles.text,
                styles.description,
                styles.embedMargin
              )}
            >
              <Text source={embed.description} context="embedDescription" />
            </div>
          )}
          {fields.length === 0 ? null : (
            <div className={styles.fields}>
              {fields.map((field, position) => (
                <div
                  // oxlint-disable-next-line react/no-array-index-key -- payload order is the identity; fields have no key of their own.
                  key={position}
                  className={styles.field}
                  style={fieldStyles[position]}
                >
                  <div className={cx(styles.text, styles.fieldName)}>
                    <Text source={field.name} context="embedFieldName" />
                  </div>
                  <div className={cx(styles.text, styles.fieldValue)}>
                    <Text source={field.value} context="embedFieldValue" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {embed.image ? (
            <div className={styles.media}>
              <Image
                reference={embed.image.url}
                alt=""
                className={styles.image}
              />
            </div>
          ) : null}
          {embed.thumbnail ? (
            <div className={styles.thumbnail}>
              <Image
                reference={embed.thumbnail.url}
                alt=""
                className={styles.thumbnailImage}
              />
            </div>
          ) : null}
          {footer || time !== undefined ? (
            <div className={cx(styles.footer, styles.embedMargin)}>
              {footer?.iconUrl ? (
                <Image
                  reference={footer.iconUrl}
                  alt=""
                  className={styles.footerIcon}
                />
              ) : null}
              <span className={cx(styles.text, styles.footerText)}>
                {footer ? (
                  <Text source={footer.text} context="embedFooter" />
                ) : null}
                {footer && time !== undefined ? (
                  <span className={styles.footerSeparator}>•</span>
                ) : null}
                {time}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
};
