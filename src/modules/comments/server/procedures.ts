import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { COMMENT_ID_PREFIX, DEFAULT_LIMIT } from "@/lib/constants";
import { generateUniqueId } from "@/lib/utils";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { z } from "zod";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        comment: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the video id and comment from the input
      const { videoId, comment } = input;

      // Get the user from the context
      const { user } = ctx;

      // Insert the new comment into the database
      const [newComment] = await db
        .insert(comments)
        .values({
          id: generateUniqueId(COMMENT_ID_PREFIX),
          userId: user.id,
          videoId,
          comment,
        })
        .returning();

      return newComment;
    }),
  getMany: baseProcedure
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
    .query(async ({ input }) => {
      // Get the video id from the input
      const { videoId, cursor, limit } = input;

      // Run paginated comments and total count queries in parallel for efficiency
      const [allVideoComments, [totalComments]] = await Promise.all([
        db
          .select({
            ...getTableColumns(comments),
            user: users,
          })
          .from(comments)
          .innerJoin(users, eq(comments.userId, users.id))
          .where(
            cursor
              ? and(
                  eq(comments.videoId, videoId),
                  or(
                    lt(comments.updatedAt, cursor.updatedAt),
                    and(
                      eq(comments.updatedAt, cursor.updatedAt),
                      lt(comments.id, cursor.id)
                    )
                  )
                )
              : eq(comments.videoId, videoId)
          )
          .orderBy(desc(comments.updatedAt))
          .limit(limit + 1),
        db
          .select({ count: count(comments.id) })
          .from(comments)
          .where(eq(comments.videoId, videoId)),
      ]);

      const hasMore = allVideoComments.length > limit;
      const items = hasMore ? allVideoComments.slice(0, -1) : allVideoComments;
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
        totalComments: totalComments.count,
      };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const { user } = ctx;

      // Delete the comment if the user is the owner
      const [deletedComment] = await db
        .delete(comments)
        .where(and(eq(comments.id, id), eq(comments.userId, user.id)))
        .returning();

      if (!deletedComment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      return deletedComment;
    }),
});
