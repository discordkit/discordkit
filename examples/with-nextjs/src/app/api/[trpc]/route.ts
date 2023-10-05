import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./trpc";

const handler = async (req: Request): Promise<Response> =>
  fetchRequestHandler({
    endpoint: `/api`,
    req,
    router: appRouter,
    createContext: () => ({})
  });

export { handler as GET };
