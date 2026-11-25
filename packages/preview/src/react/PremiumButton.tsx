import type { ReactElement } from "react";
import type { Button } from "@discordkit/client/components/types/Button";
import { ShopIcon } from "./icons.js";
import { PrimaryButton } from "./PrimaryButton.js";
import { useSceneSettings } from "./SceneContext.js";
import styles from "./PremiumButton.module.css";

export interface PremiumButtonProps {
  button: Button;
}

/**
 * `ButtonStyle.Premium`: a button that buys one of the app's SKUs. The payload names only the SKU; the client draws a shop icon, the product's name and its price, so those come from the scene's `context.skus`. A SKU the scene does not list is drawn as "Unknown SKU".
 *
 * Unverified: the blurple fill (the stylesheet does not say which colour a premium button takes) and how the name and price are joined.
 */
export const PremiumButton = ({ button }: PremiumButtonProps): ReactElement => {
  const { context } = useSceneSettings();
  const sku =
    button.skuId === undefined ? undefined : context?.skus?.[button.skuId];
  const name = sku?.name ?? `Unknown SKU`;
  return (
    <PrimaryButton
      button={button}
      label={sku?.price === undefined ? name : `${name} · ${sku.price}`}
      leading={<ShopIcon className={styles.shopIcon} />}
    />
  );
};
