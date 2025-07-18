import {
  VideoThumbnail,
  VideoThumbnailSkeleton,
} from "@/modules/videos/ui/components/video-thumbnail";
import Link from "next/link";
import { TGetOnePlaylistOutput } from "../../types";
import { PlaylistInfo, PlaylistSkeleton } from "./playlist-info";

interface PlaylistGridCardProps {
  playlist: TGetOnePlaylistOutput[number];
  onRemove?: () => void;
  isPending?: boolean;
}

export const PlaylistGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <VideoThumbnailSkeleton />
      <PlaylistSkeleton />
    </div>
  );
};

export const PlaylistGridCard: React.FC<PlaylistGridCardProps> = ({
  playlist,
  onRemove,
  isPending,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <Link href={`/videos/${playlist.video.id}`}>
        <VideoThumbnail
          thumbnailUrl={playlist.video.thumbnailUrl}
          title={playlist.video.title}
          duration={playlist.video.duration}
          previewUrl={playlist.video.previewUrl}
        />
      </Link>

      <PlaylistInfo
        playlist={playlist}
        onRemove={onRemove}
        isPending={isPending}
      />
    </div>
  );
};
