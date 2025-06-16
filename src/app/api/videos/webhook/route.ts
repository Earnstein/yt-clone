import { db } from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetDeletedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
  VideoAssetUpdatedWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";

const MUX_WEBHOOK_SECRET = process.env.MUX_WEBHOOK_SECRET;

type MuxWebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetUpdatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

export const POST = async (request: Request) => {
  if (!MUX_WEBHOOK_SECRET) {
    throw new Error("MUX_WEBHOOK_SECRET is not set");
  }

  const headersList = await headers();

  const body = await request.json();
  const { type, data } = body;

  const muxSignature = headersList.get("mux-signature");

  if (!muxSignature) {
    return Response.json(
      { message: "mux-signature is not set" },
      { status: 401 }
    );
  }

  const payload = JSON.stringify(body);
  mux.webhooks.verifySignature(
    payload,
    {
      "mux-signature": muxSignature,
    },
    MUX_WEBHOOK_SECRET
  );

  switch (type as MuxWebhookEvent["type"]) {
    case "video.asset.created": {
      console.log("asset created fired");
      if (!data.upload_id) {
        return Response.json(
          { message: "No upload Id found" },
          { status: 400 }
        );
      }
      await db
        .update(videos)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status,
        })
        .where(eq(videos.id, data.passthrough));

      break;
    }
    case "video.asset.ready": {
      console.log("asset ready fired");
      const eventData = data as VideoAssetReadyWebhookEvent["data"];
      const playbackId = eventData?.playback_ids?.[0]?.id;
      if (!playbackId) {
        return Response.json(
          { message: "No playback id found" },
          { status: 400 }
        );
      }

      const generatedThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
      const generatedPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;

      const duration =
        eventData?.duration && Math.round(eventData.duration * 1000);
      // Upload thumbnail to UploadThing
      const [video] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, data.passthrough));
      if (video?.thumbnailKey && video?.previewKey) {
        // Already uploaded, skip
        break;
      }
      const utApi = new UTApi();
      const [thumbnailData, previewData] = await utApi.uploadFilesFromUrl([
        generatedThumbnailUrl,
        generatedPreviewUrl,
      ]);

      if (thumbnailData.error || previewData.error) {
        return Response.json(
          { message: "Failed to upload thumbnail or preview" },
          { status: 400 }
        );
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } = thumbnailData.data!;
      const { key: previewKey, ufsUrl: previewUrl } = previewData.data!;

      await db
        .update(videos)
        .set({
          thumbnailKey: thumbnailKey,
          thumbnailUrl: thumbnailUrl,
          muxStatus: eventData.status,
          muxPlaybackId: playbackId,
          previewKey: previewKey,
          previewUrl: previewUrl,
          duration: duration,
        })
        .where(eq(videos.id, data.passthrough));

      break;
    }

    case "video.asset.errored": {
      console.log("asset errored fired");
      const eventData = data as VideoAssetErroredWebhookEvent["data"];

      if (!eventData.upload_id) {
        return Response.json(
          { message: "No upload id found" },
          { status: 400 }
        );
      }

      await db
        .update(videos)
        .set({
          muxStatus: eventData.status,
        })
        .where(eq(videos.id, data.passthrough));

      break;
    }

    case "video.asset.track.ready": {
      console.log("track ready fired");
      const eventData = data as VideoAssetTrackReadyWebhookEvent["data"] & {
        asset_id: string;
      };

      if (!eventData.asset_id) {
        return Response.json({ message: "No asset id found" }, { status: 400 });
      }
      const trackStatus = eventData.status;
      const trackId = eventData.id;

      await db
        .update(videos)
        .set({
          muxTrackStatus: trackStatus,
          muxTrackId: trackId,
        })
        .where(eq(videos.muxAssetId, eventData.asset_id));

      break;
    }

    case "video.asset.deleted": {
      console.log("asset deleted fired");
      const eventData = data as VideoAssetDeletedWebhookEvent["data"];

      if (!eventData.upload_id) {
        return Response.json(
          { message: "No upload id found" },
          { status: 400 }
        );
      }
      // delete uploadthing files
      const [video] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, data.passthrough));
      const keysToDelete = [video?.thumbnailKey, video?.previewKey].filter(
        (key): key is string => Boolean(key)
      );
      const utApi = new UTApi();
      if (keysToDelete.length > 0) {
        await utApi.deleteFiles(keysToDelete);
      }

      await db.delete(videos).where(eq(videos.id, data.passthrough));

      break;
    }
  }
  return new Response("Webhook received", { status: 200 });
};
