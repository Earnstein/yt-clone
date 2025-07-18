import { adaptPlaylistToMediaItem } from "@/modules/shared/types/media";
import {
  MediaInfo,
  MediaInfoSkeleton,
} from "@/modules/shared/ui/components/media-info";
import { TGetOnePlaylistOutput } from "../../types";

interface PlaylistInfoProps {
  playlist: TGetOnePlaylistOutput[number];
  onRemove?: () => void;
  isPending?: boolean;
}

// Wrapper skeleton component for backwards compatibility
export const PlaylistSkeleton = () => {
  return <MediaInfoSkeleton />;
};

// Wrapper component that adapts playlist data to unified interface
export const PlaylistInfo: React.FC<PlaylistInfoProps> = ({
  playlist,
  onRemove,
  isPending,
}) => {
  const mediaItem = adaptPlaylistToMediaItem(playlist);

  return (
    <MediaInfo item={mediaItem} onRemove={onRemove} isPending={isPending} />
  );
};
