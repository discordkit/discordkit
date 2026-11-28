import type { ReactElement } from "react";
import type { Thumbnail as ThumbnailComponent } from "@discordkit/client/components/types/Thumbnail";
import { Image } from "./Image.js";
import { useInspect } from "./Inspect.js";
import { SpoilerCover } from "./SpoilerCover.js";
import styles from "./Thumbnail.module.css";

export interface ThumbnailProps {
  component: ThumbnailComponent;
}

/** A Thumbnail, as a section's accessory: an 85px square with rounded corners, the picture cropped to fill it, its `description` as alt text, and the spoiler treatment when it is marked as one. A picture that is missing is drawn as the empty loading box. */
export const Thumbnail = ({ component }: ThumbnailProps): ReactElement => {
  const inspect = useInspect(component);
  const image = (
    <div
      className={styles.thumbnail}
      {...(component.spoiler === true ? undefined : inspect)}
    >
      <Image
        reference={component.media.url}
        alt={component.description ?? ``}
        className={styles.image}
      />
    </div>
  );
  return component.spoiler === true ? (
    <SpoilerCover className={styles.cover} inspect={inspect}>
      {image}
    </SpoilerCover>
  ) : (
    image
  );
};
