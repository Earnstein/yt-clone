import { db } from "@/db";
import { commentReactions, comments, users } from "@/db/schema";
import { COMMENT_ID_PREFIX, DEFAULT_LIMIT } from "@/lib/constants";
import { generateUniqueId } from "@/lib/utils";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
} from "drizzle-orm";
import { z } from "zod";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string().trim().min(1, { message: "Video ID is required" }),
        comment: z.string().trim().min(1, { message: "Comment is required" }),
        parentId: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the video id and comment from the input
      const { videoId, comment, parentId } = input;

      // Get the user from the context
      const { user } = ctx;

      // Check if the comment is valid
      if (!comment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Comment is required",
        });
      }

      // Check for existing parent comment
      const [existingParentComment] = await db
        .select()
        .from(comments)
        .where(inArray(comments.id, parentId ? [parentId] : []));

      if (!existingParentComment && parentId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Parent comment not found",
        });
      }

      if (existingParentComment?.parentId && parentId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot reply to a reply",
        });
      }

      // Insert the new comment into the database
      const [newComment] = await db
        .insert(comments)
        .values({
          id: generateUniqueId(COMMENT_ID_PREFIX),
          userId: user.id,
          videoId,
          comment,
          parentId,
        })
        .returning();

      return newComment;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string(),
        parentId: z.string().nullish(),
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
      // Get the video id from the input
      const { videoId, cursor, limit, parentId } = input;
      const { clerkUserId } = ctx;

      // Get the current user (if logged in)
      let userId;
      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.id, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      // Get the viewer's reactions
      const viewerReaction = db.$with("viewer_reactions").as(
        db
          .select({
            type: commentReactions.type,
            commentId: commentReactions.commentId,
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, userId ? [userId] : []))
      );

      // Get the viewer's replies
      const viewerReplies = db.$with("viewer_replies").as(
        db
          .select({
            parentId: comments.parentId,
            count: count(comments.id).as("count"),
          })
          .from(comments)
          .where(isNotNull(comments.parentId))
          .groupBy(comments.parentId)
      );

      // Run paginated comments and total count queries in parallel for efficiency
      const [allVideoComments, [totalComments]] = await Promise.all([
        db
          .with(viewerReaction, viewerReplies)
          .select({
            ...getTableColumns(comments),
            user: users,
            likeCount: db.$count(
              commentReactions,
              and(
                eq(commentReactions.type, "like"),
                eq(commentReactions.commentId, comments.id)
              )
            ),
            dislikeCount: db.$count(
              commentReactions,
              and(
                eq(commentReactions.type, "dislike"),
                eq(commentReactions.commentId, comments.id)
              )
            ),
            replyCount: viewerReplies.count,
            viewerReaction: viewerReaction.type,
          })
          .from(comments)
          .innerJoin(users, eq(comments.userId, users.id))
          .leftJoin(viewerReaction, eq(viewerReaction.commentId, comments.id))
          .leftJoin(viewerReplies, eq(viewerReplies.parentId, comments.id))
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
              : and(
                  eq(comments.videoId, videoId),
                  parentId
                    ? eq(comments.parentId, parentId)
                    : isNull(comments.parentId)
                )
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
