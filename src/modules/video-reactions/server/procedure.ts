import { db } from "@/db";
import { videoReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const videoReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { user } = ctx;

      // Attempt to delete the existing like
      const [deletedVideoReaction] = await db
        .delete(videoReactions)
        .where(
          and(
            eq(videoReactions.userId, user.id),
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.type, "like") // Ensure it's a "like" reaction
          )
        )
        .returning();

      // If a like was deleted, return it
      if (deletedVideoReaction) {
        return deletedVideoReaction;
      }

      // Otherwise, insert a new like
      const [newVideoReaction] = await db
        .insert(videoReactions)
        .values({ userId: user.id, type: "like", videoId: videoId })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: { type: "like" },
        })
        .returning();

      return newVideoReaction;
    }),
  dislike: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { user } = ctx;

      // Attempt to delete the existing dislike
      const [deletedVideoReaction] = await db
        .delete(videoReactions)
        .where(
          and(
            eq(videoReactions.userId, user.id),
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.type, "dislike") // Ensure it's a "dislike" reaction
          )
        )
        .returning();

      // If a dislike was deleted, return it
      if (deletedVideoReaction) {
        return deletedVideoReaction;
      }

      // Otherwise, insert or update a new dislike
      const [newVideoReaction] = await db
        .insert(videoReactions)
        .values({ userId: user.id, type: "dislike", videoId: videoId })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: { type: "dislike" },
        })
        .returning();

      return newVideoReaction;
    }),
});
