import * as v from "valibot";
import { boundedString, snowflake } from "@discordkit/core";
import { interactionTypeSchema } from "./InteractionType.js";

/**
 * ### [Interaction Callback](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback)
 *
 * When responding to an interaction received, you can make a `POST` request to `/interactions/<interaction_id>/<interaction_token>/callback`. `interactionId` is the unique id of that individual Interaction from the received payload. `interactionToken` is the unique token for that interaction from the received payload. If you are receiving Interactions over the gateway, you **have to respond via HTTP**. Responses to Interactions **are not sent as commands over the gateway**. **If you send this request for an interaction received over HTTP, respond to the original HTTP request with a 202 and no body.** If you receive interactions over HTTP, your server can also respond to the received POST request. You'll want to respond with a 200 status code (if everything went well), as well as specifying a type and data, which is an {@link InteractionCallbackResponse | Interaction Response object}:@app.route('/', methods=['POST']) def my_command(): if request.json["type"] == 1: return jsonify({ "type": 1 }) else: return jsonify({ "type": 4, "data": { "tts": False, "content": "Congrats on sending your command!", "embeds": [], "allowed_mentions": { "parse": [] } } })
 */
export const interactionCallbackSchema = v.object({
  /** ID of the interaction */
  id: snowflake,
  /** Interaction type */
  type: interactionTypeSchema,
  /** Instance ID of the Activity if one was launched or joined */
  activityInstanceId: v.exactOptional(boundedString()),
  /** ID of the message that was created by the interaction */
  responseMessageId: v.exactOptional(snowflake),
  /** Whether or not the message is in a loading state */
  responseMessageLoading: v.exactOptional(v.boolean()),
  /** Whether or not the response message was ephemeral */
  responseMessageEphemeral: v.exactOptional(v.boolean())
});

export interface InteractionCallback extends v.InferOutput<
  typeof interactionCallbackSchema
> {}
