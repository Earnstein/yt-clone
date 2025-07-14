import { db } from "@/db";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { z } from "zod";

export const playlistRouter = createTRPCRouter({
  getHistory: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string(),
            viewedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { user } = ctx;

      const viewVideoViews = db.$with("view_video_views").as(
        db
          .select({
            videoId: videoViews.videoId,
            viewedAt: videoViews.updatedAt,
          })
          .from(videoViews)
          .where(eq(videoViews.userId, user.id))
      );

      const data = await db
        .with(viewVideoViews)
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
          viewedAt: viewVideoViews.viewedAt,
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(viewVideoViews, eq(videos.id, viewVideoViews.videoId))
        .where(
          and(
            eq(videos.visibility, "public"),
            cursor
              ? or(
                  lt(viewVideoViews.viewedAt, cursor.viewedAt),
                  and(
                    eq(viewVideoViews.viewedAt, cursor.viewedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(viewVideoViews.viewedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            viewedAt: lastItem.viewedAt,
          }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
  getLiked: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string(),
            likedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { user } = ctx;

      const viewerVideoReaction = db.$with("viewer_video_reaction").as(
        db
          .select({
            videoId: videoReactions.videoId,
            likedAt: videoReactions.updatedAt,
          })
          .from(videoReactions)
          .where(
            and(
              eq(videoReactions.userId, user.id),
              eq(videoReactions.type, "like")
            )
          )
      );

      const data = await db
        .with(viewerVideoReaction)
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
          likedAt: viewerVideoReaction.likedAt,
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .innerJoin(
          viewerVideoReaction,
          eq(videos.id, viewerVideoReaction.videoId)
        )
        .where(
          and(
            eq(videos.visibility, "public"),
            cursor
              ? or(
                  lt(viewerVideoReaction.likedAt, cursor.likedAt),
                  and(
                    eq(viewerVideoReaction.likedAt, cursor.likedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(viewerVideoReaction.likedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            likedAt: lastItem.likedAt,
          }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
  removeFromHistory: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { videoId } = input;
      const { user } = ctx;

      const [deletedView] = await db
        .delete(videoViews)
        .where(
          and(eq(videoViews.videoId, videoId), eq(videoViews.userId, user.id))
        )
        .returning();

      if (!deletedView) {
        throw new Error("Video view not found");
      }

      return {
        success: true,
        deletedView,
      };
    }),
  removeFromLiked: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { videoId } = input;
      const { user } = ctx;

      const [deletedReaction] = await db
        .delete(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, user.id),
            eq(videoReactions.type, "like")
          )
        )
        .returning();

      if (!deletedReaction) {
        throw new Error("Video not found");
      }

      return {
        success: true,
        deletedReaction,
      };
    }),
});
