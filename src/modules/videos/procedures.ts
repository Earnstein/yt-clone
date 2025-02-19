import { db } from "@/db";
import { videos, videoUpdateSchema } from "@/db/schema";
import { VIDEO_ID_PREFIX } from "@/lib/constants";
import { mux } from "@/lib/mux";
import { generateUniqueId } from "@/lib/utils";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
export const videosRouter = createTRPCRouter({
  restoreThumbnail: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      if (!video.muxPlaybackId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video is not processed yet",
        });
      }

      const thumbNailUrl = `https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg`;

      const [updatedVideo] = await db
        .update(videos)
        .set({ thumbnailUrl: thumbNailUrl })
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      return updatedVideo;
    }),
  uploadVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: to turn this into a upload procedure
      const { id: userId } = ctx.user;

      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.id, input.videoId));

      const videoId = video[0].id;

      if (!video) {
        throw new Error("Video not found");
      }

      if (video[0].userId !== userId) {
        throw new Error("You are not allowed to upload this video");
      }

      const upload = await mux.video.uploads.create({
        new_asset_settings: {
          passthrough: videoId,
          playback_policy: ["public"],
          input: [
            {
              generated_subtitles: [{ language_code: "en", name: "English" }],
            },
          ],
        },
        cors_origin: "*", // TODO: in production, restrict this to the frontend domain
      });

      await db
        .update(videos)
        .set({
          muxUploadId: upload.id,
        })
        .where(eq(videos.id, input.videoId));

      return {
        url: upload.url,
      };
    }),
  createVideo: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        categoryId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const video = await db.insert(videos).values({
        id: generateUniqueId(VIDEO_ID_PREFIX),
        userId,
        title: input.title,
        description: input.description,
        categoryId: input.categoryId,
      });

      return video;
    }),
  updateVideo: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video ID is required",
        });
      }

      const video = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      return video;
    }),

  deleteVideo: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      await db
        .delete(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));

      return {
        message: "Video deleted successfully",
      };
    }),
});
