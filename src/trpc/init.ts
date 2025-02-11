import { db } from "@/db";
import { users } from "@/db/schema";
import { ratelimit } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  try {
    const { userId } = await auth();
    return { clerkUserId: userId };
  } catch (error) {
    console.error("Failed to authenticate user:", error);
    return { clerkUserId: null };
  }
});

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<TRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.clerkUserId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, ctx.clerkUserId))
    .limit(1);
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const { success } = await ratelimit.limit(ctx.clerkUserId);
  if (!success) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  }
  return next({ ctx: { ...ctx, user } });
});
