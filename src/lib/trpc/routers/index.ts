import { router } from "@/lib/trpc/init";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { videoRouter } from "./video";

export const appRouter = router({
    auth: authRouter,
    user: userRouter,
    video: videoRouter
})

export type AppRouter = typeof appRouter;