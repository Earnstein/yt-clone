import { db } from "@/db";
import {
  playlists,
  playlistVideos,
  users,
  videoReactions,
  videos,
  videoViews,
} from "@/db/schema";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { generateUniqueId } from "@/lib/utils";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  desc,
  eq,
  exists,
  getTableColumns,
  lt,
  or,
  SQL,
  sql,
} from "drizzle-orm";
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

  createPlaylist: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        visibility: z.enum(["public", "private"]).default("private"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name, description, visibility } = input;
      const { user } = ctx;

      const [newPlaylist] = await db
        .insert(playlists)
        .values({
          id: generateUniqueId("pl"),
          name,
          description,
          visibility,
          userId: user.id,
        })
        .returning();

      if (!newPlaylist) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create playlist",
        });
      }

      return {
        success: true,
        playlist: newPlaylist,
      };
    }),

  getPlaylists: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { user } = ctx;

      const data = await db
        .select({
          ...getTableColumns(playlists),
          videoCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlists.id)
          ),
          user: users,
        })
        .from(playlists)
        .innerJoin(users, eq(playlists.userId, users.id))
        .where(
          and(
            eq(playlists.userId, user.id),
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt),
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlists.updatedAt), desc(playlists.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        items,
        nextCursor,
      };
    }),

  getPlaylistsForVideos: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        cursor: z
          .object({
            id: z.string(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit, videoId } = input;
      const { user } = ctx;

      const data = await db
        .select({
          ...getTableColumns(playlists),
          videoCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlists.id)
          ),
          user: users,
          isInPlaylist: videoId
            ? (exists(
                db
                  .select()
                  .from(playlistVideos)
                  .where(
                    and(
                      eq(playlistVideos.playlistId, playlists.id),
                      eq(playlistVideos.videoId, videoId)
                    )
                  )
              ) as SQL<boolean>)
            : sql<boolean>`false`,
        })
        .from(playlists)
        .innerJoin(users, eq(playlists.userId, users.id))
        .where(
          and(
            eq(playlists.userId, user.id),
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt),
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlists.updatedAt), desc(playlists.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
  addToPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        videoId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input;
      const { user } = ctx;

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(
          and(eq(playlists.id, playlistId), eq(playlists.userId, user.id))
        );

      if (!existingPlaylist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      const [newPlaylist] = await db
        .insert(playlistVideos)
        .values({
          playlistId,
          videoId,
        })
        .returning();

      if (!newPlaylist) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create playlist",
        });
      }

      return {
        success: true,
        playlistVideo: newPlaylist,
      };
    }),

  removeFromPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        videoId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input;
      const { user } = ctx;

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(
          and(eq(playlists.id, playlistId), eq(playlists.userId, user.id))
        );

      if (!existingPlaylist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }
      const [deletedPlaylist] = await db
        .delete(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )
        .returning();

      if (!deletedPlaylist) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create playlist",
        });
      }

      return {
        success: true,
        playlistVideo: deletedPlaylist,
      };
    }),
});
