import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "./init";
import { router } from "./trpc";

const handler = async (req: Request): Promise<Response> =>
  fetchRequestHandler({
    endpoint: `/api/trpc`,
    req,
    router,
    createContext
  });

export { handler as GET, handler as POST };
