import Link from "next/link";
import { TGetManyVideosOutput } from "../../types";
import { VideoInfo, VideoInfoSkeleton } from "./video-info";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";

interface VideoGridCardProps {
  video: TGetManyVideosOutput["items"][number];
  onRemove?: () => void;
  isPending?: boolean;
}

export const VideoGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <VideoThumbnailSkeleton />
      <VideoInfoSkeleton />
    </div>
  );
};

export const VideoGridCard: React.FC<VideoGridCardProps> = ({
  video,
  onRemove,
  isPending,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <Link href={`/videos/${video.id}`}>
        <VideoThumbnail
          thumbnailUrl={video.thumbnailUrl}
          title={video.title}
          duration={video.duration}
          previewUrl={video.previewUrl}
        />
      </Link>

      <VideoInfo video={video} onRemove={onRemove} isPending={isPending} />
    </div>
  );
};
