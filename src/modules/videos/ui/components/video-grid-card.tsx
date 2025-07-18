import { adaptVideoToMediaItem } from "@/modules/shared/types/media";
import {
  MediaGridCard,
  MediaGridCardSkeleton,
} from "@/modules/shared/ui/components/media-grid-card";
import { TGetManyVideosOutput } from "../../types";

interface VideoGridCardProps {
  video: TGetManyVideosOutput["items"][number];
  onRemove?: () => void;
  isPending?: boolean;
}

// Wrapper skeleton component for backwards compatibility
export const VideoGridCardSkeleton = () => {
  return <MediaGridCardSkeleton />;
};

// Wrapper component that adapts video data to unified interface
export const VideoGridCard: React.FC<VideoGridCardProps> = ({
  video,
  onRemove,
  isPending,
}) => {
  const mediaItem = adaptVideoToMediaItem(video);

  return (
    <MediaGridCard item={mediaItem} onRemove={onRemove} isPending={isPending} />
  );
};
