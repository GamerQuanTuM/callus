import { privateProcedure, router } from "../init";
import { z } from "zod";
import { type Bookmark, bookmarks, type Like, likes, users, videos } from "@/lib/db/schema";
import { and, desc, eq, lt } from "drizzle-orm";

export const videoRouter = router({
    create: privateProcedure.input(
        z.object({
            title: z.string().min(2).max(50),
            description: z.string().max(150).optional(),
            file: z.string(),
        })
    ).mutation(async ({ input, ctx }) => {
        const { title, description, file } = input;

        const [video] = await ctx.db
            .insert(videos)
            .values({
                title,
                description,
                userId: ctx.user.userId,
                videoUrl: file,
            })
            .returning();

        return {
            message: "Video uploaded successfully",
            video
        };
    }),

    feed: privateProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(10),
                cursor: z.string().optional(),
            })
        )
        .query(async ({ input, ctx }) => {
            const { limit, cursor } = input;
            const currentUserId = ctx.user.userId;

            const userDetails = await ctx.db.query.users.findFirst({
                where: eq(users.id, currentUserId),
            });


            // Fetch videos with pagination
            let cursorDate: Date | undefined = undefined;
            if (cursor) {
                const parsed = new Date(cursor);
                if (!isNaN(parsed.getTime())) cursorDate = parsed;
            }

            const videoQuery = ctx.db
                .select()
                .from(videos)
                .leftJoin(likes, eq(videos.id, likes.videoId))
                .leftJoin(bookmarks, eq(videos.id, bookmarks.videoId))
                .innerJoin(users, eq(videos.userId, users.id))
                .where(cursorDate ? lt(videos.createdAt, cursorDate) : undefined)
                .orderBy(desc(videos.createdAt))
                .limit(limit + 1); // Get one extra to check if there's more

            const items = await videoQuery;

            // Group by video and transform data
            const videoMap = new Map();

            items.forEach((row) => {
                const video = row.videos;
                if (!videoMap.has(video.id)) {
                    videoMap.set(video.id, {
                        ...video,
                        user: row.users,
                        likes: [],
                        bookmarks: [],
                    });
                }

                const videoData = videoMap.get(video.id);
                if (row.likes) videoData.likes.push(row.likes);
                if (row.bookmarks) videoData.bookmarks.push(row.bookmarks);
            });

            const videoItems = Array.from(videoMap.values());
            const hasMore = videoItems.length > limit;
            const actualItems = hasMore ? videoItems.slice(0, limit) : videoItems;

            // Transform to desired format
            // In your videoRouter feed procedure, update the transformation:
            const transformedItems = actualItems.map(item => ({
                id: item.id,
                user: {
                    id: item.user.id, // Add user ID
                    name: item.user.name,
                    displayName: item.user.displayName,
                },
                description: item.description || "",
                stats: {
                    likes: item.likes.filter((like: Like) => like !== null).length,
                    bookmarks: item.bookmarks.filter((bookmark: Bookmark) => bookmark !== null).length,
                },
                isLiked: item.likes.some((like: Like) => like?.userId === currentUserId),
                isBookmarked: item.bookmarks.some((bookmark: Bookmark) => bookmark?.userId === currentUserId),
                isFollowing: userDetails?.following?.includes(item.user.id) || false,
                videoUrl: item.videoUrl,
                createdAt: item.createdAt,
            }));

            // Generate nextCursor from the last item's createdAt. Support Date or string values.
            let nextCursor: string | null = null;
            if (hasMore) {
                const last = actualItems[actualItems.length - 1];
                const lastCreatedAt = last?.createdAt;
                if (lastCreatedAt instanceof Date) {
                    nextCursor = lastCreatedAt.toISOString();
                } else if (typeof lastCreatedAt === "string") {
                    const d = new Date(lastCreatedAt);
                    if (!isNaN(d.getTime())) nextCursor = d.toISOString();
                }
            }

            return {
                feeds: transformedItems,
                pagination: {
                    nextCursor,
                    hasMore,
                },
            };
        }),

    toggleLike: privateProcedure
        .input(z.object({
            videoId: z.string().uuid(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { videoId } = input;
            const userId = ctx.user.userId;

            const existingLike = await ctx.db.query.likes.findFirst({
                where: and(
                    eq(likes.userId, userId),
                    eq(likes.videoId, videoId)
                )
            });

            if (existingLike) {
                await ctx.db.delete(likes).where(eq(likes.id, existingLike.id));
                return { isLiked: false };
            } else {
                await ctx.db.insert(likes).values({
                    userId,
                    videoId,
                });
                return { isLiked: true };
            }
        }),

    toggleBookmark: privateProcedure
        .input(z.object({
            videoId: z.string().uuid(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { videoId } = input;
            const userId = ctx.user.userId;

            const existingBookmark = await ctx.db.query.bookmarks.findFirst({
                where: and(
                    eq(bookmarks.userId, userId),
                    eq(bookmarks.videoId, videoId)
                )
            });

            if (existingBookmark) {
                await ctx.db.delete(bookmarks).where(eq(bookmarks.id, existingBookmark.id));
                return { isBookmarked: false };
            } else {
                await ctx.db.insert(bookmarks).values({
                    userId,
                    videoId,
                });
                return { isBookmarked: true };
            }
        }),

    toggleFollow: privateProcedure
        .input(z.object(
            {
                profileId: z.uuid(),
            }
        )).mutation(async ({ input, ctx }) => {
            const { profileId } = input;
            const userId = ctx.user.userId;

            const userDetails = await ctx.db.query.users.findFirst({
                where: eq(users.id, userId),
            });

            const followArray = userDetails?.following || [];

            if (followArray.includes(profileId)) {
                await ctx.db.update(users).set({
                    following: followArray.filter((id) => id !== profileId)
                }).where(eq(users.id, userId));

                return {
                    message: "User unfollowed successfully",
                    isFollowing: false
                }
            } else {
                await ctx.db.update(users).set({
                    following: [...followArray, profileId]
                }).where(eq(users.id, userId));
                return {
                    message: "User followed successfully",
                    isFollowing: true
                }
            }
        })
});