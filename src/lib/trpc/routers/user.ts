import { TRPCError } from "@trpc/server";
import { privateProcedure, router } from "@/lib/trpc/init";


export const userRouter = router({
    session: privateProcedure
        .query(async ({ ctx }) => {
            const user = await ctx.db.query.users.findFirst({
                where: (users, { eq }) => eq(users.id, ctx.user.userId),
            });

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            const { password, ...userWithoutPassword } = user;

            return {
                message: "User fetched successfully",
                user: userWithoutPassword,
            };
        }),
});
