import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        videoId: z.string(),
      })
    )
    .middleware(async ({ input }) => {
      // This code runs on your server before upload
      const { userId } = await auth();

      // If you throw, the user will not be able to upload
      if (!userId) throw new UploadThingError("Unauthorized");

      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user) throw new UploadThingError("User not found");

      const [existingVideo] = await db
        .select({
          thumbnailKey: videos.thumbnailKey,
          previewKey: videos.previewKey,
        })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, userId)));

      if (!existingVideo) throw new UploadThingError("Video not found");

      //* Delete existing files from UploadThing
      const keysToDelete = [
        existingVideo.thumbnailKey,
        existingVideo.previewKey,
      ].filter((key): key is string => Boolean(key));
      if (keysToDelete.length > 0) {
        const utApi = new UTApi();

        await utApi.deleteFiles(keysToDelete);
        await db
          .update(videos)
          .set({
            thumbnailKey: null,
            thumbnailUrl: null,
            previewKey: null,
            previewUrl: null,
          })
          .where(eq(videos.id, input.videoId));
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { user, videoId: input.videoId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Update the video to add the thumbnail and key
      await db
        .update(videos)
        .set({
          thumbnailUrl: file.ufsUrl,
          thumbnailKey: file.key,
        })
        .where(
          and(
            eq(videos.id, metadata.videoId),
            eq(videos.userId, metadata.user.id)
          )
        );

      // Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.user.id };
    }),

  userBannerUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .middleware(async () => {
      const { userId } = await auth();
      const utApi = new UTApi();
      if (!userId) throw new UploadThingError("Unauthorized");

      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (user.bannerKey) {
        await utApi.deleteFiles([user.bannerKey]);
        await db
          .update(users)
          .set({ bannerKey: null, bannerUrl: null })
          .where(eq(users.id, userId));
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Update the user to add the banner and key
      await db
        .update(users)
        .set({
          bannerUrl: file.ufsUrl,
          bannerKey: file.key,
        })
        .where(eq(users.id, metadata.userId));

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
