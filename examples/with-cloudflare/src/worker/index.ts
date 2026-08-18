import type { Env } from "./inspector.js";

export { GatewayInspector } from "./inspector.js";
export type { Env } from "./inspector.js";

/**
 * The Worker is deliberately thin: it serves the SPA and forwards the
 * `/api/stream` upgrade to the singleton Durable Object. All the state lives in
 * the DO, because the Gateway allows exactly one session per bot.
 *
 * Static assets are handled by the asset server ahead of this handler; only
 * `/api/*` reaches here (see `run_worker_first` in wrangler.jsonc).
 */
export default {
  fetch(request: Request, env: Env): Response | Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === `/api/stream`) {
      // One named instance, so every viewer joins the same inspector session
      // rather than opening competing Gateway connections.
      const id = env.INSPECTOR.idFromName(`singleton`);
      return env.INSPECTOR.get(id).fetch(request);
    }

    return new Response(`Not found`, { status: 404 });
  }
} satisfies ExportedHandler<Env>;
