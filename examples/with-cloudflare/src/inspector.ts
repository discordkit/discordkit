import { DurableObject } from "cloudflare:workers";
import {
  createConnection,
  intentsFor,
  onMessageCreate,
  onReady,
  type GatewayConnection
} from "@discordkit/gateway";

export interface Env {
  INSPECTOR: DurableObjectNamespace<GatewayInspector>;
  DISCORD_BOT_TOKEN?: string;
  /** Overrides the Gateway URL. Used by tests to point at a mock. */
  GATEWAY_URL?: string;
}

/** An observed event, as pushed to connected browsers. */
export interface ObservedEvent {
  type: string;
  at: number;
  data: unknown;
}

/**
 * Holds the single outbound Gateway connection and fans events out to browsers.
 *
 * A Durable Object is the only serverless primitive that offers what the Gateway
 * requires: a persistent, singleton, outbound WebSocket. Discord permits one
 * session per bot, so this is deliberately ONE object — not one per viewer.
 *
 * Note it passes an **explicit** `connection` to every subscription rather than
 * using the package's ambient singleton: module globals are per-isolate, so an
 * ambient connection would be the wrong shape here.
 */
export class GatewayInspector extends DurableObject<Env> {
  #connection: GatewayConnection | null = null;
  #events: ObservedEvent[] = [];
  #subscriptions: Array<() => void> = [];

  /**
   * Open the Gateway connection. Idempotent — a second call while live is a
   * no-op, since a duplicate session would be rejected by Discord anyway.
   */
  start(token: string, gatewayUrl?: string): { started: boolean } {
    if (this.#connection) return { started: false };

    const connection = createConnection({
      token,
      // The handlers this app registers declare the intents it needs, so the
      // mask can't drift from what's actually consumed.
      intents: intentsFor(onMessageCreate),
      ...(gatewayUrl === undefined ? {} : { url: gatewayUrl })
    });
    this.#connection = connection;

    this.#subscriptions.push(
      onReady(
        (data) => {
          this.#record(`READY`, data);
        },
        { connection }
      ),
      onMessageCreate(
        (message) => {
          this.#record(`MESSAGE_CREATE`, message);
        },
        { connection }
      )
    );

    connection.connect();
    return { started: true };
  }

  #record(type: string, data: unknown): void {
    this.#events.push({ type, at: Date.now(), data });
  }

  /** Events observed so far. */
  observed(): ObservedEvent[] {
    return this.#events;
  }

  /**
   * The intents this app needs, derived from the handlers it registers rather
   * than hand-maintained — so the mask can't drift from what's consumed.
   */
  declaredIntents(): string[] {
    return intentsFor(onMessageCreate);
  }

  /** Current connection state, for the spike's assertions. */
  status(): { state: string; sessionId: string | null } {
    return {
      state: this.#connection?.state ?? `idle`,
      sessionId: this.#connection?.sessionId ?? null
    };
  }

  stop(): void {
    for (const off of this.#subscriptions) off();
    this.#subscriptions = [];
    this.#connection?.close();
    this.#connection = null;
  }
}

export default {
  fetch(request: Request, env: Env): Response {
    const url = new URL(request.url);
    const stub = env.INSPECTOR.get(env.INSPECTOR.idFromName(`singleton`));

    // Durable Object RPC returns a custom thenable rather than a real Promise,
    // so `await` reads as redundant to the typechecker. `Response.json` accepts
    // the value directly, which sidesteps the question entirely.
    if (url.pathname === `/start`) {
      const token = env.DISCORD_BOT_TOKEN ?? ``;
      return Response.json(stub.start(token, env.GATEWAY_URL));
    }
    if (url.pathname === `/events`) {
      return Response.json(stub.observed());
    }
    if (url.pathname === `/status`) {
      return Response.json(stub.status());
    }
    return new Response(`Gateway Event Inspector`, {
      headers: { "content-type": `text/plain` }
    });
  }
} satisfies ExportedHandler<Env>;
