import { db } from "@/db";
import { videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const videoViewsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { user } = ctx;

      const [existingVideoView] = await db
        .select()
        .from(videoViews)
        .where(
          and(eq(videoViews.userId, user.id), eq(videoViews.videoId, videoId))
        );

      if (!existingVideoView) {
        const [newVideoView] = await db
          .insert(videoViews)
          .values({ userId: user.id, videoId: videoId })
          .returning();

        return newVideoView;
      }

      return existingVideoView;
    }),
});
