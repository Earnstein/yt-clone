import { Skeleton } from "@/components/ui/skeleton";
import { TPlaylists } from "@/modules/playlist/types";

interface PlaylistInfoProps {
  playlist: TPlaylists[number];
}

export const PlaylistInfoSkeleton = () => {
  return (
    <div className="flex gap-3">
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[70%]" />
        <Skeleton className="h-4 w-[50%]" />
      </div>
    </div>
  );
};

export const PlaylistInfo: React.FC<PlaylistInfoProps> = ({ playlist }) => {
  return (
    <div className="flex gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium line-clamp-1 lg:line-clamp-2 break-words">
          {playlist.name}
        </h3>
        <p className="text-xs text-muted-foreground">Playlist</p>
        <p className="text-xs text-muted-foreground group-hover:text-primary">
          View full playlist
        </p>
      </div>
    </div>
  );
};
