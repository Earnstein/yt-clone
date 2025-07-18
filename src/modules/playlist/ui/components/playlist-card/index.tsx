import { THUMBNAIL_PLACEHOLDER_URL } from "@/lib/constants";
import { TPlaylists } from "@/modules/playlist/types";
import { PlaylistInfo, PlaylistInfoSkeleton } from "./playlist-info";
import {
  PlaylistThumbnail,
  PlaylistThumbnailSkeleton,
} from "./playlist-thumbnail";

interface PlaylistCardProps {
  playlist: TPlaylists[number];
}

export const PlaylistCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-ful">
      <PlaylistThumbnailSkeleton />
      <PlaylistInfoSkeleton />
    </div>
  );
};
export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  return (
    <div>
      <div className="flex flex-col gap-2 w-full group">
        <PlaylistThumbnail
          imageUrl={playlist.thumbNailUrl || THUMBNAIL_PLACEHOLDER_URL}
          title={playlist.name}
          videoCount={playlist.videoCount}
          playlistId={playlist.id}
        />

        <PlaylistInfo playlist={playlist} />
      </div>
    </div>
  );
};
