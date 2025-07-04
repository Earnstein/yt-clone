import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { formatNumber } from "@/lib/utils";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import { TGetManyVideosOutput } from "../../types";
import { VideoMenus } from "./video-menus";

interface VideoInfoProps {
  video: TGetManyVideosOutput["items"][number];
  onRemove?: () => void;
}

export const VideoInfoSkeleton = () => {
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

export const VideoInfo: React.FC<VideoInfoProps> = ({ video, onRemove }) => {
  const memoizedValuess = useMemo(() => {
    return {
      compactViews: formatNumber(video.viewCount, { notation: "compact" }),
      compactDate: formatDistanceToNow(video.createdAt, { addSuffix: true }),
    };
  }, [video]);
  return (
    <div className="flex gap-3">
      <Link href={`/users/${video.user.id}`}>
        <UserAvatar
          imageUrl={video.user.imageUrl}
          name={video.user.firstName ?? ""}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/videos/${video.id}`}>
          <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-base break-words">
            {video.title}
          </h3>
        </Link>
        <Link href={`/users/${video.user.id}`}>
          <UserInfo name={video.user.firstName ?? ""} />
        </Link>
        <Link href={`/videos/${video.id}`}>
          <p className="text-sm text-gray-600 line-clamp-1">
            {memoizedValuess.compactViews} views • {memoizedValuess.compactDate}
          </p>
        </Link>
      </div>

      <div className="flex-shrink-0">
        <VideoMenus videoId={video.id} onRemove={onRemove} />
      </div>
    </div>
  );
};
