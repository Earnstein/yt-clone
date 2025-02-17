import { db } from "@/db";
import { videos } from "@/db/schema";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, lt, or } from "drizzle-orm";
import { z } from "zod";
export const studioRouter = createTRPCRouter({
  getVideoById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { id } = input;

      const [video] = await db.select().from(videos).where(eq(videos.id, id));

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      return video;
    }),
  getAllVideos: protectedProcedure
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
      const { id: userId } = ctx.user;

      const data = await db
        .select()
        .from(videos)
        .where(
          cursor
            ? and(
                eq(videos.userId, userId),
                or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              )
            : eq(videos.userId, userId)
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        // Add 1 to the limit to check if there is a next page
        .limit(limit + 1);
      const hasMore = data.length > limit;
      //Remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      //set the next cursor to the last item if there is more data
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
