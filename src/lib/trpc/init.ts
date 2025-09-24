import { initTRPC, TRPCError } from "@trpc/server"
import jwt from "jsonwebtoken"
import superjson from "superjson"
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import { db } from "../db"

export interface AuthUser {
  userId: string;
  email: string;
}

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  let user: AuthUser | null = null;
  
  const authHeader = opts.req.headers.get("authorization");
  
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthUser;
      user = decoded;
    } catch (error) {
      console.warn("Invalid token:", error);
    }
  }
  
  return {
    db,
    req: opts.req,
    user,
  }
}

type CreateTRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<CreateTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})


const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const router = t.router
export const publicProcedure = t.procedure
export const createCallerFactory = t.createCallerFactory;
export const privateProcedure = t.procedure.use(isAuthed)