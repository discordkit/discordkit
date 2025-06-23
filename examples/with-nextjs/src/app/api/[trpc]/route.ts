import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "./init";
import { appRouter } from "./trpc";

const handler = async (req: Request): Promise<Response> =>
  fetchRequestHandler({
    endpoint: `/api/trpc`,
    req,
    router: appRouter,
    createContext: createTRPCContext
  });

export { handler as GET, handler as POST };
