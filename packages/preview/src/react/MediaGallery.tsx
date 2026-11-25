import { useMemo, type ReactElement, type SyntheticEvent } from "react";
import type { MediaGallery as MediaGalleryComponent } from "@discordkit/client/components/types/MediaGallery";
import type { MediaGalleryItem } from "@discordkit/client/components/types/MediaGalleryItem";
import { arrangeGallery, type GalleryLayout } from "../format/galleryLayout.js";
import { Image } from "./Image.js";
import { useSceneSettings } from "./SceneContext.js";
import styles from "./MediaGallery.module.css";

/**
 * Marks an item whose aspect ratio is not in the payload and has to be read from its picture once it loads. The Node renderer finds these after every image has decoded and writes each picture's ratio onto its item as `--dkp-ratio`, as the `onLoad` below does in a browser.
 */
export const measureAttribute = `data-discordkit-preview-measure`;

/** Writes a loaded picture's natural aspect ratio onto the item that holds it. */
const measure = (event: SyntheticEvent<HTMLImageElement>): void => {
  const image = event.currentTarget;
  const item = image.closest<HTMLElement>(`[${measureAttribute}]`);
  if (item && image.naturalWidth > 0 && image.naturalHeight > 0) {
    item.style.setProperty(
      `--dkp-ratio`,
      String(image.naturalWidth / image.naturalHeight)
    );
  }
};

export interface MediaGalleryProps {
  component: MediaGalleryComponent;
}

const bandClasses: Record<GalleryLayout, string> = {
  oneByOne: styles.oneByOne,
  oneByOneMosaic: `${styles.oneByOne} ${styles.mosaic}`,
  oneByTwo: styles.oneByTwo,
  oneByTwoLayoutThree: `${styles.oneByTwo} ${styles.layoutThree}`,
  twoByTwo: styles.twoByTwo,
  threeByThree: styles.threeByThree
};

interface GalleryItemProps {
  item: MediaGalleryItem;
  /** Extra classes for where the item sits in its band. */
  className?: string;
}

/** One picture: its alt text from `description`, its ratio from the payload or its file, and the spoiler treatment when it is marked as one. */
const GalleryItem = ({ item, className }: GalleryItemProps): ReactElement => {
  const { revealSpoilers } = useSceneSettings();
  const { width, height } = item.media;
  const known =
    typeof width === `number` &&
    typeof height === `number` &&
    width > 0 &&
    height > 0;
  const ratio = known ? width / height : undefined;
  // React's style type has no entries for custom properties; this is the one the gallery's rules read.
  const style = useMemo(
    (): Record<string, string> | undefined =>
      ratio === undefined ? undefined : { "--dkp-ratio": String(ratio) },
    [ratio]
  );
  const measured = useMemo(
    () => (ratio === undefined ? { [measureAttribute]: `` } : {}),
    [ratio]
  );
  const image = (
    <Image
      reference={item.media.url}
      alt={item.description ?? ``}
      className={styles.media}
      onLoad={known ? undefined : measure}
    />
  );
  const classes = [styles.item, className].filter(Boolean).join(` `);
  if (item.spoiler === true) {
    return (
      <label
        className={`${classes} ${styles.spoiler}`}
        style={style}
        {...measured}
      >
        <input
          className={styles.toggle}
          type="checkbox"
          aria-label="Spoiler"
          defaultChecked={revealSpoilers}
        />
        {image}
        <span className={styles.warning}>Spoiler</span>
      </label>
    );
  }
  return (
    <div className={classes} style={style} {...measured}>
      {image}
    </div>
  );
};

/**
 * A Media Gallery: one to ten pictures in the arrangement Discord uses for their count. A picture that is missing, or that failed to load, is drawn as Discord's empty loading box.
 */
export const MediaGallery = ({
  component
}: MediaGalleryProps): ReactElement => {
  // Payload order is the identity of every band and item below; none has a stable key of its own.
  /* oxlint-disable react/no-array-index-key */
  return (
    <div className={styles.gallery}>
      {arrangeGallery(component.items).map(({ layout, items }, band) => (
        <div key={band} className={bandClasses[layout]}>
          {layout === `oneByTwoLayoutThree` ? (
            <>
              <GalleryItem item={items[0]} className={styles.solo} />
              <div className={styles.duo}>
                {items.slice(1).map((item, index) => (
                  <GalleryItem key={index} item={item} />
                ))}
              </div>
            </>
          ) : (
            items.map((item, index) => (
              <GalleryItem
                key={index}
                item={item}
                className={layout === `oneByOne` ? styles.single : undefined}
              />
            ))
          )}
        </div>
      ))}
    </div>
    /* oxlint-enable react/no-array-index-key */
  );
};
