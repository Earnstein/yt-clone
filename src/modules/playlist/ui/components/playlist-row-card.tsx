import { adaptPlaylistToMediaItem } from "@/components/shared/types/media";
import {
  MediaRowCard,
  MediaRowCardSkeleton,
} from "@/components/shared/ui/components/media-row-card";
import { TGetOnePlaylistOutput } from "../../types";

interface PlaylistRowCardProps {
  playlist: TGetOnePlaylistOutput[number];
  onRemove?: () => void;
  isPending?: boolean;
  size?: "default" | "compact";
}

interface PlaylistRowCardSkeletonProps {
  size?: "default" | "compact";
}

// Wrapper skeleton component for backwards compatibility
export const PlaylistRowCardSkeleton = ({
  size = "default",
}: PlaylistRowCardSkeletonProps) => {
  return <MediaRowCardSkeleton size={size} />;
};

// Wrapper component that adapts playlist data to unified interface
export const PlaylistRowCard: React.FC<PlaylistRowCardProps> = ({
  playlist,
  onRemove,
  size = "default",
  isPending,
}) => {
  const mediaItem = adaptPlaylistToMediaItem(playlist);

  return (
    <MediaRowCard
      item={mediaItem}
      onRemove={onRemove}
      size={size}
      isPending={isPending}
    />
  );
};
