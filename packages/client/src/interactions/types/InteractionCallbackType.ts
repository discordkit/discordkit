import { enum_ } from "valibot";

export enum InteractionCallbackType {
  /** ACK a `Ping` */
  PONG = 1,
  /** Respond to an interaction with a message */
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  /** ACK an interaction and edit a response later, the user sees a loading state */
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  /** For components, ACK an interaction and edit the original message later; the user does not see a loading state */
  DEFERRED_UPDATE_MESSAGE = 6,
  /** For components, edit the message the component was attached to (Only valid for component-based interactions) */
  UPDATE_MESSAGE = 7,
  /** Respond to an autocomplete interaction with suggested choices */
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
  /** Respond to an interaction with a popup modal (Not available for `MODAL_SUBMIT` and `PING` interactions.) */
  MODAL = 9,
  /** @deprecated **Deprecated**; respond to an interaction with an upgrade button, only available for apps with monetization enabled */
  PREMIUM_REQUIRED = 10,
  /** Launch the Activity associated with the app. Only available for apps with Activities enabled */
  LAUNCH_ACTIVITY = 12
}

export const interactionCallbackTypeSchema = enum_(InteractionCallbackType);
