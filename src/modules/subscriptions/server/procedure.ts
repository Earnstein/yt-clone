import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
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
  getSubscribers: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            creatorId: z.string(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_LIMIT),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const { cursor, limit } = input;

      const subscribers = await db
        .select({
          ...getTableColumns(subscriptions),
          user: {
            ...getTableColumns(users),
            subscriberCount: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, users.id)
            ),
          },
        })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.creatorId, users.id))
        .where(
          and(
            eq(subscriptions.viewerId, user.id),
            cursor
              ? or(
                  lt(subscriptions.updatedAt, cursor.updatedAt),
                  and(
                    eq(subscriptions.updatedAt, cursor.updatedAt),
                    eq(subscriptions.creatorId, cursor.creatorId)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(subscriptions.updatedAt), desc(subscriptions.creatorId))
        .limit(limit + 1);

      const hasMore = subscribers.length > limit;
      const items = hasMore ? subscribers.slice(0, -1) : subscribers;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            creatorId: lastItem.creatorId,
            updatedAt: lastItem.updatedAt,
          }
        : null;
      return {
        items,
        nextCursor,
      };
    }),
});
