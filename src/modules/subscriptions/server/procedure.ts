import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const subscriptionsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const { user } = ctx;

      if (userId === user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot subscribe to yourself",
        });
      }

      // Insert subscription or do nothing if it already exists
      const [subscription] = await db
        .insert(subscriptions)
        .values({
          viewerId: user.id,
          creatorId: userId,
        })
        .onConflictDoNothing({
          target: [subscriptions.viewerId, subscriptions.creatorId],
        })
        .returning();

      if (!subscription) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Already subscribed",
        });
      }

      return subscription;
    }),

  delete: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const { user } = ctx;

      if (userId === user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot unsubscribe from yourself",
        });
      }

      // Single delete query with return check
      const [deleted] = await db
        .delete(subscriptions)
        .where(
          and(
            eq(subscriptions.viewerId, user.id),
            eq(subscriptions.creatorId, userId)
          )
        )
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      return deleted;
    }),
});
