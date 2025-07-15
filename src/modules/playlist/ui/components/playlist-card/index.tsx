import { THUMBNAIL_PLACEHOLDER_URL } from "@/lib/constants";
import { TPlaylists } from "@/modules/playlist/types";
import Link from "next/link";
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
    <Link href={`/playlists/${playlist.id}`}>
      <div className="flex flex-col gap-2 w-full group">
        <PlaylistThumbnail
          imageUrl={THUMBNAIL_PLACEHOLDER_URL}
          title={playlist.name}
          videoCount={playlist.videoCount}
        />

        <PlaylistInfo playlist={playlist} />
      </div>
    </Link>
  );
};
