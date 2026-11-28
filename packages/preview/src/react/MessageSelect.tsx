import type { ReactElement } from "react";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Select } from "@discordkit/client/components/types/Select";
import { ChannelSelect } from "./ChannelSelect.js";
import { MentionableSelect } from "./MentionableSelect.js";
import { RoleSelect } from "./RoleSelect.js";
import { StringSelect } from "./StringSelect.js";
import { UserSelect } from "./UserSelect.js";

export interface MessageSelectProps {
  select: Select;
}

/** A select menu in an action row, drawn by the component for its type. */
export const MessageSelect = ({ select }: MessageSelectProps): ReactElement => {
  switch (select.type) {
    case ComponentType.StringSelect:
      return <StringSelect select={select} />;
    case ComponentType.UserSelect:
      return <UserSelect select={select} />;
    case ComponentType.RoleSelect:
      return <RoleSelect select={select} />;
    case ComponentType.MentionableSelect:
      return <MentionableSelect select={select} />;
    case ComponentType.ChannelSelect:
      return <ChannelSelect select={select} />;
  }
};
