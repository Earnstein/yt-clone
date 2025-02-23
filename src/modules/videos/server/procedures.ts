import { db } from "@/db";
import { users, videos, videoUpdateSchema } from "@/db/schema";
import { VIDEO_ID_PREFIX } from "@/lib/constants";
import { mux } from "@/lib/mux";
import { generateUniqueId } from "@/lib/utils";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";
export const videosRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [video] = await db
        .select({
          ...getTableColumns(videos),
          user: {
            ...getTableColumns(users),
          },
        })
        .from(videos)
        .where(and(eq(videos.id, input.id)))
        .innerJoin(users, eq(videos.userId, users.id));

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      return video;
    }),
  restoreThumbnail: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      // Check if video exists
      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      // Check if video has a thumbnail
      if (video.thumbnailKey) {
        const utApi = new UTApi();

        // Delete the thumbnail from UploadThing
        await utApi.deleteFiles([video.thumbnailKey]);

        // Update the video to remove the thumbnail
        await db
          .update(videos)
          .set({
            thumbnailKey: null,
            thumbnailUrl: null,
          })
          .where(eq(videos.id, input.videoId));
      }

      // Check if video has a mux playback id
      if (!video.muxPlaybackId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "This video has no generated thumbnail. Please upload a video first.",
        });
      }

      // Generate the thumbnail url
      const generatedThumbnailUrl = `https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg`;

      const utApi = new UTApi();
      const { data: thumbnailData, error: thumbnailError } =
        await utApi.uploadFilesFromUrl(generatedThumbnailUrl);

      if (thumbnailError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate thumbnail",
        });
      }

      // Update the video to add the thumbnail
      const [updatedVideo] = await db
        .update(videos)
        .set({
          thumbnailKey: thumbnailData.key,
          thumbnailUrl: thumbnailData.ufsUrl,
        })
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
      const utApi = new UTApi();

      const [video] = await db
        .delete(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      // Delete associated files from UploadThing
      const keysToDelete = [video.thumbnailKey, video.previewKey].filter(
        (key): key is string => Boolean(key)
      );
      if (keysToDelete.length > 0) {
        await utApi.deleteFiles(keysToDelete);
      }

      return {
        message: "Video deleted successfully",
      };
    }),
});
