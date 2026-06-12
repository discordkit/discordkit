import { Link } from "waku";
import type { ReactNode } from "react";
import { getSession } from "#src/lib/session";
import { hasUsableSession } from "#src/lib/session-shared";

// Public landing. Server component: reads the session (via getSession, which
// uses Waku's unstable_getRequest under the hood) to decide what to show.
// Only a boolean's worth of session state reaches the rendered HTML — the
// token never leaves the server.
export default async function HomePage(): Promise<ReactNode> {
  const loggedIn = hasUsableSession(await getSession());
  return (
    <div className="card">
      {loggedIn ? (
        <>
          <p>{`You're logged in.`}</p>
          <Link className="btn" to="/dashboard">
            {`Go to dashboard`}
          </Link>
        </>
      ) : (
        <>
          <p>{`Log in with Discord to see your profile and the servers you're in.`}</p>
          <a className="btn" href="/api/auth/login">
            {`Login with Discord`}
          </a>
        </>
      )}
    </div>
  );
}

export const getConfig = () => ({ render: `dynamic` }) as const;
