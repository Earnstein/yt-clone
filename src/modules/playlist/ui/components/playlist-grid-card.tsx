import { adaptPlaylistToMediaItem } from "@/components/shared/types/media";
import {
  MediaGridCard,
  MediaGridCardSkeleton,
} from "@/components/shared/ui/components/media-grid-card";
import { TGetOnePlaylistOutput } from "../../types";

interface PlaylistGridCardProps {
  playlist: TGetOnePlaylistOutput[number];
  onRemove?: () => void;
  isPending?: boolean;
}

// Wrapper skeleton component for backwards compatibility
export const PlaylistGridCardSkeleton = () => {
  return <MediaGridCardSkeleton />;
};

// Wrapper component that adapts playlist data to unified interface
export const PlaylistGridCard: React.FC<PlaylistGridCardProps> = ({
  playlist,
  onRemove,
  isPending,
}) => {
  const mediaItem = adaptPlaylistToMediaItem(playlist);

  return (
    <MediaGridCard item={mediaItem} onRemove={onRemove} isPending={isPending} />
  );
};
