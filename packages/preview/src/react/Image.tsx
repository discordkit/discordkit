import type { ReactElement } from "react";
import { useSceneSettings } from "./SceneContext.js";
import styles from "./Image.module.css";

/** A one-pixel transparent GIF. A placeholder is an image of nothing over the placeholder colour, so it keeps the size and box of the image it stands in for. */
export const transparentPixel = `data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7`;

/** The class the Node renderer adds to an image that arrived but would not decode, so it draws as the same placeholder. */
export const placeholderClass = styles.placeholder;

export interface ImageProps {
  /** The image as the scene names it: a URL or `attachment://name`. */
  reference: string;
  alt: string;
  className: string;
}

/**
 * An image from the scene, loaded from wherever the scene's asset resolver says. When the resolver has no image for it, an empty box in the placeholder colour is drawn at the same size, which is also how Discord shows an image its media proxy has not fetched yet.
 */
export const Image = ({
  reference,
  alt,
  className
}: ImageProps): ReactElement => {
  const src = useSceneSettings().assetUrl(reference);
  return src === null ? (
    <img
      className={`${className} ${styles.placeholder}`}
      src={transparentPixel}
      alt={alt}
      data-discordkit-preview-missing={reference}
    />
  ) : (
    <img className={className} src={src} alt={alt} draggable={false} />
  );
};
