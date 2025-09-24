
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from "../../../../lib/trpc/routers"
import { createTRPCContext } from "@/lib/trpc/init"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  })

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH, handler as OPTIONS }