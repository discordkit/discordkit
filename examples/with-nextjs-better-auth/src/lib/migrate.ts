import { getMigrations } from "better-auth/db/migration";
import { auth } from "#src/lib/auth";

/**
 * Create Better Auth's tables (`user`, `session`, `account`, `verification`) if
 * they don't already exist. Better Auth is database-backed, so the schema must
 * exist before the first request — `getMigrations(...).runMigrations()` is the
 * programmatic equivalent of the `@better-auth/cli migrate` command, and it's
 * idempotent (only creates what's missing).
 *
 * Run once at server startup (see instrumentation.ts). For the in-memory E2E
 * database this is the *only* way to get the schema (the CLI migrates a file,
 * not the running process's in-memory instance); for the dev file database it
 * just means you don't have to run the CLI by hand. A real deployment would run
 * migrations as a deploy step against the managed database instead.
 */
let migrated = false;

export const ensureMigrated = async (): Promise<void> => {
  if (migrated) {
    return;
  }
  migrated = true;
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
};
