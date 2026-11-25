import type { ReactElement } from "react";
import type { Button } from "@discordkit/client/components/types/Button";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { DangerButton } from "./DangerButton.js";
import { LinkButton } from "./LinkButton.js";
import { PremiumButton } from "./PremiumButton.js";
import { PrimaryButton } from "./PrimaryButton.js";
import { SecondaryButton } from "./SecondaryButton.js";
import { SuccessButton } from "./SuccessButton.js";

export interface MessageButtonProps {
  button: Button;
}

/** A Button component, drawn by the component for its style. */
export const MessageButton = ({ button }: MessageButtonProps): ReactElement => {
  switch (button.style) {
    case ButtonStyle.Primary:
      return <PrimaryButton button={button} />;
    case ButtonStyle.Secondary:
      return <SecondaryButton button={button} />;
    case ButtonStyle.Success:
      return <SuccessButton button={button} />;
    case ButtonStyle.Danger:
      return <DangerButton button={button} />;
    case ButtonStyle.Link:
      return <LinkButton button={button} />;
    case ButtonStyle.Premium:
      return <PremiumButton button={button} />;
    default:
      throw new Error(
        `@discordkit/preview cannot draw a button of style ${String(button.style)}. Discord's styles are 1 (Primary) to 6 (Premium), and a button of any other style is refused when the message is sent. Set \`style\` to one of the ButtonStyle values.`
      );
  }
};
