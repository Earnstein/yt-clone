import { db } from "@/db";
import {
  subscriptions,
  users,
  videoReactions,
  videos,
  videoUpdateSchema,
  videoViews,
} from "@/db/schema";
import { VIDEO_ID_PREFIX } from "@/lib/constants";
import { mux } from "@/lib/mux";
import { generateUniqueId } from "@/lib/utils";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, inArray, isNotNull } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";
export const videosRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx;

      // Get the current user (if logged in)
      let userId;
      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.id, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      // Get the current user's reactions to videos
      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            type: videoReactions.type,
          })
          .from(videoReactions)
          .where(inArray(videoReactions.userId, userId ? [userId] : []))
      );

      // Get the current user's subscriptions
      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select()
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
      );

      // Fetch the video and join with user, reactions, and subscriptions
      const [video] = await db
        .with(viewerReactions, viewerSubscriptions)
        .select({
          ...getTableColumns(videos),
          user: {
            ...getTableColumns(users), // get the user columns
            viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(
              Boolean
            ), // check if the viewer is subscribed to the user
            subscriberCount: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, users.id)
            ), // count the number of subscribers
          },
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)), // count the number of views
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ), // count the number of likes
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ), // count the number of dislikes
          viewerReaction: viewerReactions.type, // get the viewer's reaction to the video
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
        .leftJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, users.id)
        )
        .where(and(eq(videos.id, input.id)));

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      return video;
    }),
  revalidate: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      // Find the video for the current user
      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      // Check if video exists
      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      if (!video.muxUploadId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No video upload in progress. Please upload a video first.",
        });
      }

      const upload = await mux.video.uploads.retrieve(video.muxUploadId);
      if (!upload || !upload.asset_id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No video upload in progress. Please upload a video first.",
        });
      }

      const asset = await mux.video.assets.retrieve(upload.asset_id);

      if (!asset) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No video asset found. Please upload a video first.",
        });
      }

      const [updatedVideo] = await db
        .update(videos)
        .set({
          muxPlaybackId: asset.playback_ids?.[0]?.id,
          muxStatus: asset.status,
          muxAssetId: asset.id,
          duration: asset.duration ? Math.round(asset.duration * 1000) : 0,
        })
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)))
        .returning();

      return updatedVideo;
    }),
  restoreThumbnail: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      // Find the video for the current user
      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      // Check if video exists
      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      // If video has a thumbnail, delete it from UploadThing and DB
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

      // Generate the thumbnail url from mux
      const generatedThumbnailUrl = `https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg`;

      const utApi = new UTApi();
      // Upload the generated thumbnail to UploadThing
      const { data: thumbnailData, error: thumbnailError } =
        await utApi.uploadFilesFromUrl(generatedThumbnailUrl);

      if (thumbnailError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate thumbnail",
        });
      }

      // Update the video with the new thumbnail info
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
      const { id: userId } = ctx.user;

      // Find the video by ID
      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.id, input.videoId));

      const videoId = video[0].id;

      if (!video) {
        throw new Error("Video not found");
      }

      // Check if the current user owns the video
      if (video[0].userId !== userId) {
        throw new Error("You are not allowed to upload this video");
      }

      // Create a new Mux upload for the video
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
        cors_origin: "*",
      });

      // Update the video with the mux upload ID
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
        visibility: z.enum(["public", "private"]).default("private"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      // Insert the new video into the database
      const video = await db.insert(videos).values({
        id: generateUniqueId(VIDEO_ID_PREFIX),
        userId,
        title: input.title,
        description: input.description,
        categoryId: input.categoryId,
        visibility: input.visibility,
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

      // Update the video with new data
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

      // Delete the video from the database
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
