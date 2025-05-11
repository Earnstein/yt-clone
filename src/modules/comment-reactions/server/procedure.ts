import { db } from "@/db";
import { commentReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const commentReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const { user } = ctx;

      // Attempt to delete the existing like
      const [deletedCommentReaction] = await db
        .delete(commentReactions)
        .where(
          and(
            eq(commentReactions.userId, user.id),
            eq(commentReactions.commentId, commentId),
            eq(commentReactions.type, "like") // Ensure it's a "like" reaction
          )
        )
        .returning();

      // If a like was deleted, return it
      if (deletedCommentReaction) {
        return deletedCommentReaction;
      }

      // Otherwise, insert a new like
      const [newCommentReaction] = await db
        .insert(commentReactions)
        .values({ userId: user.id, type: "like", commentId: commentId })
        .onConflictDoUpdate({
          target: [commentReactions.userId, commentReactions.commentId],
          set: { type: "like" },
        })
        .returning();

      return newCommentReaction;
    }),
  dislike: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const { user } = ctx;

      // Attempt to delete the existing dislike
      const [deletedCommentReaction] = await db
        .delete(commentReactions)
        .where(
          and(
            eq(commentReactions.userId, user.id),
            eq(commentReactions.commentId, commentId),
            eq(commentReactions.type, "dislike") // Ensure it's a "dislike" reaction
          )
        )
        .returning();

      // If a dislike was deleted, return it
      if (deletedCommentReaction) {
        return deletedCommentReaction;
      }

      // Otherwise, insert or update a new dislike
      const [newCommentReaction] = await db
        .insert(commentReactions)
        .values({ userId: user.id, type: "dislike", commentId: commentId })
        .onConflictDoUpdate({
          target: [commentReactions.userId, commentReactions.commentId],
          set: { type: "dislike" },
        })
        .returning();

      return newCommentReaction;
    }),
});
