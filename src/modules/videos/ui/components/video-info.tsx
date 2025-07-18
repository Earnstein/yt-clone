import { adaptVideoToMediaItem } from "@/modules/shared/types/media";
import {
  MediaInfo,
  MediaInfoSkeleton,
} from "@/modules/shared/ui/components/media-info";
import { TGetManyVideosOutput } from "../../types";

interface VideoInfoProps {
  video: TGetManyVideosOutput["items"][number];
  onRemove?: () => void;
  isPending?: boolean;
}

// Wrapper skeleton component for backwards compatibility
export const VideoInfoSkeleton = () => {
  return <MediaInfoSkeleton />;
};

// Wrapper component that adapts video data to unified interface
export const VideoInfo: React.FC<VideoInfoProps> = ({
  video,
  onRemove,
  isPending,
}) => {
  const mediaItem = adaptVideoToMediaItem(video);

  return (
    <MediaInfo item={mediaItem} onRemove={onRemove} isPending={isPending} />
  );
};
