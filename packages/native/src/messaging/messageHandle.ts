import { defineBindings } from "../ffi/bindings.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";
import { readUser } from "../users/userHandle.js";
import { readChannel } from "./channelHandle.js";
import { readAdditionalContent } from "./additionalContent.js";
import { DISCLOSURE_TYPE_BY_CODE, type Message } from "./types.js";

/**
 * Bindings + snapshot reader for `discordpp::MessageHandle` — the template for the messaging domain, read once into a plain {@link Message} (a message has no interactive handle ops, so it's a snapshot, not a live wrapper like `Lobby`).
 *
 * Cross-domain reads: author/recipient embed {@link readUser | User}s; the channel embeds a {@link readChannel | Channel}; additional content embeds {@link readAdditionalContent}. The `Lobby()` getter would yield a live `LobbyHandle`, but a snapshot must not embed a live wrapper — so we read only the lobby's `Id()` (a local one-line binding) and expose `lobbyId`, leaving the consumer to `getLobby(id)` if they want the live object. Metadata + moderation metadata use the seam's `readProperties`.
 */
const bindings = defineBindings({
  id: /* C */ `uint64_t Discord_MessageHandle_Id(void *self)`,
  authorId: /* C */ `uint64_t Discord_MessageHandle_AuthorId(void *self)`,
  channelId: /* C */ `uint64_t Discord_MessageHandle_ChannelId(void *self)`,
  recipientId: /* C */ `uint64_t Discord_MessageHandle_RecipientId(void *self)`,
  sentFromGame: /* C */ `bool Discord_MessageHandle_SentFromGame(void *self)`,
  sentTimestamp: /* C */ `uint64_t Discord_MessageHandle_SentTimestamp(void *self)`,
  editedTimestamp: /* C */ `uint64_t Discord_MessageHandle_EditedTimestamp(void *self)`,
  content: /* C */ `void Discord_MessageHandle_Content(void *self, Discord_String *returnValue)`,
  rawContent: /* C */ `void Discord_MessageHandle_RawContent(void *self, Discord_String *returnValue)`,
  metadata: /* C */ `void Discord_MessageHandle_Metadata(void *self, Discord_Properties *returnValue)`,
  moderationMetadata: /* C */ `void Discord_MessageHandle_ModerationMetadata(void *self, Discord_Properties *returnValue)`,
  author: /* C */ `bool Discord_MessageHandle_Author(void *self, Discord_UserHandle *returnValue)`,
  channel: /* C */ `bool Discord_MessageHandle_Channel(void *self, Discord_ChannelHandle *returnValue)`,
  additionalContent: /* C */ `bool Discord_MessageHandle_AdditionalContent(void *self, Discord_AdditionalContent *returnValue)`,
  disclosureType: /* C */ `bool Discord_MessageHandle_DisclosureType(void *self, int *returnValue)`,
  lobby: /* C */ `bool Discord_MessageHandle_Lobby(void *self, Discord_LobbyHandle *returnValue)`,
  // Read the lobby's id WITHOUT wrapping it as a live Lobby (snapshot rule).
  lobbyId: /* C */ `uint64_t Discord_LobbyHandle_Id(void *self)`
});

/** Read a native `MessageHandle` into a plain {@link Message} snapshot. */
export const readMessage = (lib: FfiLibrary, handle: FfiOpaque): Message => {
  const b = bindings(lib);

  const readString = (
    getter: (self: FfiOpaque, out: FfiOpaque) => unknown
  ): string => {
    const out = lib.allocStringOut();
    getter(handle, out);
    return lib.decodeString(out);
  };
  const readMeta = (
    getter: (self: FfiOpaque, out: FfiOpaque) => unknown
  ): Record<string, string> => {
    const out = lib.allocPropertiesOut();
    getter(handle, out);
    return lib.readProperties(out);
  };

  const authorOut = lib.allocHandle();
  const author = b.author(handle, authorOut)
    ? readUser(lib, authorOut)
    : undefined;

  const channelOut = lib.allocHandle();
  const channel = b.channel(handle, channelOut)
    ? readChannel(lib, channelOut)
    : undefined;

  const contentOut = lib.allocHandle();
  const additionalContent = b.additionalContent(handle, contentOut)
    ? readAdditionalContent(lib, contentOut)
    : undefined;

  const disclosureOut = lib.allocUInt64Out();
  const disclosureType = b.disclosureType(handle, disclosureOut)
    ? DISCLOSURE_TYPE_BY_CODE[Number(lib.readUInt64Out(disclosureOut))]
    : undefined;

  const lobbyOut = lib.allocHandle();
  const lobbyId = b.lobby(handle, lobbyOut)
    ? (b.lobbyId(lobbyOut) as bigint)
    : undefined;

  return {
    id: b.id(handle) as bigint,
    content: readString(b.content),
    rawContent: readString(b.rawContent),
    authorId: b.authorId(handle) as bigint,
    channelId: b.channelId(handle) as bigint,
    recipientId: b.recipientId(handle) as bigint,
    sentFromGame: Boolean(b.sentFromGame(handle)),
    sentTimestamp: b.sentTimestamp(handle) as bigint,
    editedTimestamp: b.editedTimestamp(handle) as bigint,
    metadata: readMeta(b.metadata),
    moderationMetadata: readMeta(b.moderationMetadata),
    ...(author ? { author } : {}),
    ...(channel ? { channel } : {}),
    ...(lobbyId !== undefined ? { lobbyId } : {}),
    ...(additionalContent ? { additionalContent } : {}),
    ...(disclosureType !== undefined ? { disclosureType } : {})
  };
};
