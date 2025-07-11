import { db } from "@/db";
import { videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

export const videoViewsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { user } = ctx;

      const [videoView] = await db
        .insert(videoViews)
        .values({ userId: user.id, videoId: videoId })
        .onConflictDoUpdate({
          target: [videoViews.userId, videoViews.videoId],
          set: { updatedAt: new Date() },
        })
        .returning();

      return videoView;
    }),
});
