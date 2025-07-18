import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { formatNumber } from "@/lib/utils";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { VideoMenus } from "@/modules/videos/ui/components/video-menus";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import { MediaItem } from "../../types/media";

interface MediaInfoProps {
  item: MediaItem;
  onRemove?: () => void;
  isPending?: boolean;
}

export const MediaInfoSkeleton = () => {
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

export const MediaInfo: React.FC<MediaInfoProps> = ({
  item,
  onRemove,
  isPending,
}) => {
  const memoizedValues = useMemo(() => {
    return {
      compactViews: formatNumber(item.viewCount, { notation: "compact" }),
      compactDate: formatDistanceToNow(item.createdAt, { addSuffix: true }),
    };
  }, [item]);

  return (
    <div className="flex gap-3">
      <Link href={`/users/${item.user.id}`}>
        <UserAvatar
          imageUrl={item.user.imageUrl ?? ""}
          name={item.user.firstName ?? ""}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/videos/${item.id}`}>
          <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-base break-words">
            {item.title}
          </h3>
        </Link>
        <Link href={`/users/${item.user.id}`}>
          <UserInfo name={item.user.firstName ?? ""} />
        </Link>
        <Link href={`/videos/${item.id}`}>
          <p className="text-sm text-gray-600 line-clamp-1">
            {memoizedValues.compactViews} views • {memoizedValues.compactDate}
          </p>
        </Link>
      </div>

      <div className="flex-shrink-0">
        <VideoMenus
          videoId={item.id}
          onRemove={onRemove}
          isPending={isPending}
        />
      </div>
    </div>
  );
};
