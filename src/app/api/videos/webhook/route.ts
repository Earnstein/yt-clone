import { db } from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackErroredWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
  VideoAssetUpdatedWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

const MUX_WEBHOOK_SECRET = process.env.MUX_WEBHOOK_SECRET;

type MuxWebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetUpdatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetTrackErroredWebhookEvent
  | VideoAssetTrackReadyWebhookEvent;

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
      if (!data.upload_id) {
        return Response.json(
          { message: "No upload Id found" },
          { status: 400 }
        );
      }
      await db
        .update(videos)
        .set({
          muxPlaybackId: data.playback_ids[0].id,
          muxAssetId: data.id,
          muxStatus: data.status,
        })
        .where(
          and(
            eq(videos.muxUploadId, data.upload_id),
            eq(videos.id, data.passthrough)
          )
        );

      break;
    }
    case "video.asset.ready": {
      await db
        .update(videos)
        .set({
          muxStatus: data.status,
          muxPlaybackId: data.playback_ids[0].id,
        })
        .where(
          and(
            eq(videos.muxAssetId, data.id),
            eq(videos.userId, data.passthrough)
          )
        );
      break;
    }
  }
  return new Response("Webhook received", { status: 200 });
};
