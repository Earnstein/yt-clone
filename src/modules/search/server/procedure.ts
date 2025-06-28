import { db } from "@/db";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import {
  and,
  desc,
  eq,
  getTableColumns,
  ilike,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";

export const searchRouter = createTRPCRouter({
  getSearchResults: baseProcedure
    .input(
      z.object({
        query: z.string().trim().toLowerCase().nullish(),
        categoryId: z.string().nullish(),
        cursor: z
          .object({
            id: z.string(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit, query, categoryId } = input;

      const data = await db
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
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(videos.visibility, "public"),
            query ? ilike(videos.title, `%${query}%`) : undefined,
            categoryId ? eq(videos.categoryId, categoryId) : undefined,
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
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

  // Vector-based full-text search for benchmarking comparison
  getSearchResultsVector: baseProcedure
    .input(
      z.object({
        query: z.string(),
        categoryId: z.string().nullish(),
        cursor: z
          .object({
            id: z.string(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit, query, categoryId } = input;

      // Build where conditions
      const whereConditions = [];

      // Full-text search condition (only if query provided)
      if (query.trim()) {
        whereConditions.push(
          sql`to_tsvector('english', ${videos.title}) @@ plainto_tsquery('english', ${query})`
        );
      }

      // Category filtering
      if (categoryId) {
        whereConditions.push(eq(videos.categoryId, categoryId));
      }

      // Cursor-based pagination
      if (cursor) {
        // Standard time-based pagination
        whereConditions.push(
          or(
            lt(videos.updatedAt, cursor.updatedAt),
            and(
              eq(videos.updatedAt, cursor.updatedAt),
              lt(videos.id, cursor.id)
            )
          )
        );
      }

      const data = await db
        .select()
        .from(videos)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(videos.id))
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
});
