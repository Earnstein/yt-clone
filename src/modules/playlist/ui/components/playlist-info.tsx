import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { formatNumber } from "@/lib/utils";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { VideoMenus } from "@/modules/videos/ui/components/video-menus";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import { TGetOnePlaylistOutput } from "../../types";

interface PlaylistInfoProps {
  playlist: TGetOnePlaylistOutput[number];
  onRemove?: () => void;
  isPending?: boolean;
}

export const PlaylistSkeleton = () => {
  return (
    <div className="flex gap-3">
      <Skeleton className="size-10 rounded-full shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[70%]" />
      </div>
    </div>
  );
};

export const PlaylistInfo: React.FC<PlaylistInfoProps> = ({
  playlist,
  onRemove,
  isPending,
}) => {
  const memoizedValuess = useMemo(() => {
    return {
      compactViews: formatNumber(playlist.viewCount, { notation: "compact" }),
      compactDate: formatDistanceToNow(playlist.createdAt, { addSuffix: true }),
    };
  }, [playlist]);
  return (
    <div className="flex gap-3">
      <Link href={`/users/${playlist.user.id}`}>
        <UserAvatar
          imageUrl={playlist.user.imageUrl}
          name={playlist.user.firstName ?? ""}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/videos/${playlist.video.id}`}>
          <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-base break-words">
            {playlist.video.title}
          </h3>
        </Link>
        <Link href={`/users/${playlist.user.id}`}>
          <UserInfo name={playlist.user.firstName ?? ""} />
        </Link>
        <Link href={`/videos/${playlist.video.id}`}>
          <p className="text-sm text-gray-600 line-clamp-1">
            {memoizedValuess.compactViews} views • {memoizedValuess.compactDate}
          </p>
        </Link>
      </div>

      <div className="flex-shrink-0">
        <VideoMenus
          videoId={playlist.video.id}
          onRemove={onRemove}
          isPending={isPending}
        />
      </div>
    </div>
  );
};
