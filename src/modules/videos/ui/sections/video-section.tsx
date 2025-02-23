"use client";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { VideoBanner } from "../components/video-banner";
import { VideoPlayer } from "../components/video-player";
import { VideoTopRow } from "../components/video-top-row";

interface VideoSectionProps {
  videoId: string;
}

const VideoSectionSuspense: React.FC<VideoSectionProps> = ({ videoId }) => {
  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });
  return (
    <>
      <div
        className={cn(
          "aspect-video bg-black rounded-xl overflow-hidden relative",
          video.muxStatus !== "ready" && "rounded-b-none"
        )}
      >
        <VideoPlayer
          onPlay={() => {}}
          playbackId={video.muxPlaybackId}
          thumbnailUrl={video.thumbnailUrl}
        />
      </div>
      <VideoBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  );
};

export const VideoSection: React.FC<VideoSectionProps> = ({ videoId }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};
