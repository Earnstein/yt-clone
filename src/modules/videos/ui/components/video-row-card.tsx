import { adaptVideoToMediaItem } from "@/components/shared/types/media";
import {
  MediaRowCard,
  MediaRowCardSkeleton,
} from "@/components/shared/ui/components/media-row-card";
import { TGetManyVideosOutput } from "../../types";

interface VideoRowCardProps {
  video: TGetManyVideosOutput["items"][number];
  onRemove?: () => void;
  isPending?: boolean;
  size?: "default" | "compact";
}

interface VideoRowCardSkeletonProps {
  size?: "default" | "compact";
}

// Wrapper skeleton component for backwards compatibility
export const VideoRowCardSkeleton = ({
  size = "default",
}: VideoRowCardSkeletonProps) => {
  return <MediaRowCardSkeleton size={size} />;
};

// Wrapper component that adapts video data to unified interface
export const VideoRowCard: React.FC<VideoRowCardProps> = ({
  video,
  onRemove,
  size = "default",
  isPending,
}) => {
  const mediaItem = adaptVideoToMediaItem(video);

  return (
    <MediaRowCard
      item={mediaItem}
      onRemove={onRemove}
      size={size}
      isPending={isPending}
    />
  );
};
