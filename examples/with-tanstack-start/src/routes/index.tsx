import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getValidSession } from "#src/lib/auth";
import { hasUsableSession } from "#src/lib/session-shared";

// Whether the visitor already has a usable session — read server-side. Exposed
// as a server fn so the public landing can decide what to show without leaking
// the token (only the boolean crosses to the client).
const checkLoggedIn = createServerFn().handler(async () =>
  hasUsableSession(await getValidSession())
);

export const Route = createFileRoute(`/`)({
  loader: async () => ({ loggedIn: await checkLoggedIn() }),
  component: Home
});

function Home(): React.ReactNode {
  const { loggedIn } = Route.useLoaderData();
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
