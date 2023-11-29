/* eslint-disable @typescript-eslint/prefer-literal-enum-member */

import { enum_ } from "valibot";

/* eslint-disable no-bitwise */
export enum Permissions {
  /** Allows creation of instant invites */
  CREATE_INSTANT_INVITE = 1 << 0,
  /** Allows kicking members */
  KICK_MEMBERS = 1 << 1,
  /** Allows banning members */
  BAN_MEMBERS = 1 << 2,
  /** Allows all permissions and bypasses channel permission overwrites */
  ADMINISTRATOR = 1 << 3,
  /** Allows management and editing of channels */
  MANAGE_CHANNELS = 1 << 4,
  /** Allows management and editing of the guild	 */
  MANAGE_GUILD = 1 << 5,
  /** Allows for the addition of reactions to messages */
  ADD_REACTIONS = 1 << 6,
  /** Allows for viewing of audit logs */
  VIEW_AUDIT_LOG = 1 << 7,
  /** Allows for using priority speaker in a voice channel */
  PRIORITY_SPEAKER = 1 << 8,
  /** Allows the user to go live */
  STREAM = 1 << 9,
  /** Allows guild members to view a channel, which includes reading messages in text channels and joining voice channels */
  VIEW_CHANNEL = 1 << 10,
  /** Allows for sending messages in a channel and creating threads in a forum (does not allow sending messages in threads) */
  SEND_MESSAGES = 1 << 11,
  /** Allows for sending of `/tts` messages */
  SEND_TTS_MESSAGES = 1 << 12,
  /** Allows for deletion of other users messages	 */
  MANAGE_MESSAGES = 1 << 13,
  /** Links sent by users with this permission will be auto-embedded */
  EMBED_LINKS = 1 << 14,
  /** Allows for uploading images and files */
  ATTACH_FILES = 1 << 15,
  /** Allows for reading of message history */
  READ_MESSAGE_HISTORY = 1 << 16,
  /** Allows for using the `@everyone` tag to notify all users in a channel, and the `@here` tag to notify all online users in a channel */
  MENTION_EVERYONE = 1 << 17,
  /** Allows the usage of custom emojis from other servers */
  USE_EXTERNAL_EMOJIS = 1 << 18,
  /** Allows for viewing guild insights */
  VIEW_GUILD_INSIGHTS = 1 << 19,
  /** Allows for joining of a voice channel */
  CONNECT = 1 << 20,
  /** Allows for speaking in a voice channel */
  SPEAK = 1 << 21,
  /** Allows for muting members in a voice channel */
  MUTE_MEMBERS = 1 << 22,
  /** Allows for deafening of members in a voice channel */
  DEAFEN_MEMBERS = 1 << 23,
  /** Allows for moving of members between voice channels */
  MOVE_MEMBERS = 1 << 24,
  /** Allows for using voice-activity-detection in a voice channel */
  USE_VAD = 1 << 25,
  /** Allows for modification of own nickname */
  CHANGE_NICKNAME = 1 << 26,
  /** Allows for modification of other users nicknames */
  MANAGE_NICKNAMES = 1 << 27,
  /** Allows management and editing of roles */
  MANAGE_ROLES = 1 << 28,
  /** Allows management and editing of webhooks */
  MANAGE_WEBHOOKS = 1 << 29,
  /** Allows management and editing of emojis, stickers, and soundboard sounds */
  MANAGE_GUILD_EXPRESSIONS = 1 << 30,
  /** Allows members to use application commands, including slash commands and context menu commands. */
  USE_APPLICATION_COMMANDS = 1 << 31,
  /** Allows for requesting to speak in stage channels. (This permission is under active development and may be changed or removed.) */
  REQUEST_TO_SPEAK = 1 << 32,
  /** Allows for creating, editing, and deleting scheduled events */
  MANAGE_EVENTS = 1 << 33,
  /** Allows for deleting and archiving threads, and viewing all private threads */
  MANAGE_THREADS = 1 << 34,
  /** Allows for creating public and announcement threads */
  CREATE_PUBLIC_THREADS = 1 << 35,
  /** Allows for creating private threads */
  CREATE_PRIVATE_THREADS = 1 << 36,
  /** Allows the usage of custom stickers from other servers */
  USE_EXTERNAL_STICKERS = 1 << 37,
  /** Allows for sending messages in threads */
  SEND_MESSAGES_IN_THREADS = 1 << 38,
  /** Allows for using Activities (applications with the `EMBEDDED` flag) in a voice channel */
  USE_EMBEDDED_ACTIVITIES = 1 << 39,
  /** Allows for timing out users to prevent them from sending or reacting to messages in chat and threads, and from speaking in voice and stage channels */
  MODERATE_MEMBERS = 1 << 40,
  /** Allows for viewing role subscription insights */
  VIEW_CREATOR_MONETIZATION_ANALYTICS = 1 << 41,
  /** Allows for using soundboard in a voice channel */
  USE_SOUNDBOARD = 1 << 42,
  /** Allows the usage of custom soundboard sounds from other servers */
  USE_EXTERNAL_SOUNDS = 1 << 45,
  /** Allows sending voice messages */
  SEND_VOICE_MESSAGES = 1 << 46
}

export const permissionsSchema = enum_(Permissions);
