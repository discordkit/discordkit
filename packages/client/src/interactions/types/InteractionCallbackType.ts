import * as v from "valibot";

/**
 * ### [Interaction Callback Type](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback)
 *
 * When responding to an interaction received, you can make a `POST` request to `/interactions/<interaction_id>/<interaction_token>/callback`. `interactionId` is the unique id of that individual Interaction from the received payload. `interactionToken` is the unique token for that interaction from the received payload. If you are receiving Interactions over the gateway, you **have to respond via HTTP**. Responses to Interactions **are not sent as commands over the gateway**. **If you send this request for an interaction received over HTTP, respond to the original HTTP request with a 202 and no body.** If you receive interactions over HTTP, your server can also respond to the received POST request. You'll want to respond with a 200 status code (if everything went well), as well as specifying a type and data, which is an Interaction Response object:@app.route('/', methods=['POST']) def my_command(): if request.json["type"] == 1: return jsonify({ "type": 1 }) else: return jsonify({ "type": 4, "data": { "tts": False, "content": "Congrats on sending your command!", "embeds": [], "allowed_mentions": { "parse": [] } } })
 */
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

export const interactionCallbackTypeSchema = v.enum_(InteractionCallbackType);
