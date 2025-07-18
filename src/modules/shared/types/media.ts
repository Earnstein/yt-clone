import { TGetOnePlaylistOutput } from "@/modules/playlist/types";
import { TGetManyVideosOutput } from "@/modules/videos/types";

// Unified media item interface
export interface MediaItem {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  duration?: number | null;
  previewUrl?: string | null;
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
  };
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  createdAt: Date;
}

// Adapter function for playlist items
export const adaptPlaylistToMediaItem = (
  playlist: TGetOnePlaylistOutput[number]
): MediaItem => ({
  id: playlist.video.id,
  title: playlist.video.title,
  description: playlist.video.description,
  thumbnailUrl: playlist.video.thumbnailUrl,
  duration: playlist.video.duration,
  previewUrl: playlist.video.previewUrl,
  user: playlist.user,
  viewCount: playlist.viewCount,
  likeCount: playlist.likeCount,
  dislikeCount: playlist.dislikeCount,
  createdAt: playlist.createdAt,
});

// Adapter function for video items
export const adaptVideoToMediaItem = (
  video: TGetManyVideosOutput["items"][number]
): MediaItem => ({
  id: video.id,
  title: video.title,
  description: video.description,
  thumbnailUrl: video.thumbnailUrl,
  duration: video.duration,
  previewUrl: video.previewUrl,
  user: video.user,
  viewCount: video.viewCount,
  likeCount: video.likeCount,
  dislikeCount: video.dislikeCount,
  createdAt: video.createdAt,
});
