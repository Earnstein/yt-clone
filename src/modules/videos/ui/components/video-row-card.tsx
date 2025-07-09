import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/user-avatar";
import { cn, formatNumber } from "@/lib/utils";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { cva, VariantProps } from "class-variance-authority";
import Link from "next/link";
import { useMemo } from "react";
import { TGetManyVideosOutput } from "../../types";
import { VideoMenus } from "./video-menus";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";

const videoRowCardVariants = cva("group flex min-w-0", {
  variants: {
    size: {
      default: "gap-4",
      compact: "gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const thumbnailVariants = cva("relative flex-none", {
  variants: {
    size: {
      default: "w-[38%]",
      compact: "w-[168px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
  video: TGetManyVideosOutput["items"][number];
  onRemove?: () => void;
}

export const VideoRowCardSkeleton = ({
  size = "default",
}: VariantProps<typeof videoRowCardVariants>) => {
  return (
    <div className={cn(videoRowCardVariants({ size }))}>
      <div className={cn(thumbnailVariants({ size }))}>
        <VideoThumbnailSkeleton />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-x-2">
          <div className="flex-1 min-w-0">
            <Skeleton
              className={cn("h-4 w-[40%]", size === "compact" && "h-3 w-[40%]")}
            />
            {size === "default" && (
              <>
                <Skeleton className={cn("h-4 w-[20%] mt-1")} />
                <div className="flex items-center gap-2 my-3">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </>
            )}

            {size === "compact" && (
              <>
                <Skeleton className={cn("h-4 w-[50%] mt-1")} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export const VideoRowCard: React.FC<VideoRowCardProps> = ({
  video,
  onRemove,
  size = "default",
}) => {
  const memoizedViewsAndLikes = useMemo(() => {
    return {
      compactViews: formatNumber(video.viewCount, { notation: "compact" }),
      compactLikes: formatNumber(video.likeCount, { notation: "compact" }),
    };
  }, [video]);
  return (
    <div className={cn(videoRowCardVariants({ size }))}>
      <Link
        href={`/videos/${video.id}`}
        className={cn(thumbnailVariants({ size }))}
      >
        <VideoThumbnail
          thumbnailUrl={video.thumbnailUrl}
          title={video.title}
          duration={video.duration}
          previewUrl={video.previewUrl}
        />
      </Link>

      {/*Info*/}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-x-2">
          <Link href={`/videos/${video.id}`} className="flex-1 min-w-0">
            <h3
              className={cn(
                "line-clamp-2 font-medium",
                size === "compact" ? "text-sm" : "text-base"
              )}
            >
              {video.title}
            </h3>
            {size === "default" && (
              <p className="text-xs text-muted-foreground mt-1">
                {memoizedViewsAndLikes.compactViews} views •{" "}
                {memoizedViewsAndLikes.compactLikes} likes
              </p>
            )}

            {size === "default" && (
              <>
                <div className="flex items-center gap--2 my-3">
                  <UserAvatar
                    imageUrl={video.user.imageUrl}
                    name={video.user.firstName ?? ""}
                    size="sm"
                  />
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <p className="text-xs text-muted-foreground w-fit line-clamp-2 text-pretty max-w-md text-start">
                      {video.description ?? "No description"}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="center"
                    className="bg-black/70"
                  >
                    <p>From video description</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {size === "compact" && (
              <UserInfo
                name={`${video.user.firstName} ${video.user.lastName}` || ""}
                size="sm"
              />
            )}

            {size === "compact" && (
              <p className="text-xs text-muted-foreground mt-1">
                {memoizedViewsAndLikes.compactViews} views •{" "}
                {memoizedViewsAndLikes.compactLikes} likes
              </p>
            )}
          </Link>

          <div className="flex-none">
            <VideoMenus videoId={video.id} />
          </div>
        </div>
      </div>
    </div>
  );
};
