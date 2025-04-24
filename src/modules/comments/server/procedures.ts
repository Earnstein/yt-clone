import { db } from "@/db";
import { comments } from "@/db/schema";
import { COMMENT_ID_PREFIX } from "@/lib/constants";
import { generateUniqueId } from "@/lib/utils";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { eq } from "drizzle-orm";
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
      })
    )
    .query(async ({ input }) => {
      // Get the video id from the input
      const { videoId } = input;

      // Get all comments for a video
      const allVideoComments = await db
        .select()
        .from(comments)
        .where(eq(comments.videoId, videoId));

      return allVideoComments;
    }),
});
