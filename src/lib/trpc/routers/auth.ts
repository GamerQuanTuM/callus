import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { publicProcedure, router } from "@/lib/trpc/init";
import { users } from "@/lib/db/schema";
import { cookies } from "next/headers";

export const authRouter = router({
    login: publicProcedure
        .input(
            z.object({
                email: z.email(),
                password: z.string().min(6).max(100),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { email, password } = input;

            if (!email || !password) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Email and password are required",
                });
            }

            const user = await ctx.db.query.users.findFirst({
                where: (users, { eq }) => eq(users.email, email),
            });

            if (!user) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid email or password",
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid email or password",
                });
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET as string,
                { expiresIn: "1hr" }
            );

            const cookieStore = await cookies();
            cookieStore.set({
                name: "auth_token",
                value: token,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 3600,
                sameSite: "lax",
                path: "/",
            });

            // eslint-disable-next-line
            const { password: _, ...userWithoutPassword } = user;

            return {
                message: "User logged in successfully",
                user: { ...userWithoutPassword, token },
            };
        }),

    register: publicProcedure
        .input(
            z.object({
                name: z.string().min(2).max(100),
                email: z.email(),
                password: z.string().min(6).max(100),
                displayName: z.string().min(2).max(50),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { name, email, password, displayName } = input;

            const existingUser = await ctx.db.query.users.findFirst({
                where: (u, { eq }) => eq(u.email, email),
            });

            if (existingUser) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "User with this email already exists",
                });
            }

            // Display name cant contain spaces and will always be lowercase
            if (displayName.includes(" ")) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Display name cannot contain spaces",
                });
            }

            // let display = displayName.toLowerCase();

            const hashedPassword = await bcrypt.hash(password, 10);

            const [newUser] = await ctx.db
                .insert(users)
                .values({
                    name,
                    email,
                    password: hashedPassword,
                    displayName: displayName.toLowerCase(),
                })
                .returning();

            if (!newUser) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create user",
                });
            }

            // eslint-disable-next-line
            const { password: _, ...userWithoutPassword } = newUser;

            return {
                message: "User registered successfully",
                user: userWithoutPassword,
            };
        }),
});
