import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatNumber } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import { TGetOneVideoOutput } from "../../types";
import { VideoDescription } from "./video-descriptions";
import { VideoMenus } from "./video-menus";
import { VideoOwner } from "./video-owner";
import { VideoReactions } from "./video-reactions";

interface VideoTopRowProps {
  video: TGetOneVideoOutput;
}

export const VideoTopRowSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-4/5 md:w-2/5" />
      </div>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 w-[70%]">
          <Skeleton className="size-10 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-5 w-4/5 md:w-1/3" />
            <Skeleton className="h-4 w-4/5 md:w-1/5" />
          </div>
        </div>
        <Skeleton className="h-9 w-1/3 rounded-full" />
      </div>
      <div className="h-32 w-full" />
    </div>
  );
};

export const VideoTopRow: React.FC<VideoTopRowProps> = ({ video }) => {
  const viewsAndDates = useMemo(() => {
    return {
      compactViews: formatNumber(video.viewCount, { notation: "compact" }),
      expandedViews: formatNumber(video.viewCount, { notation: "standard" }),
      compactDate: formatDistanceToNow(video.createdAt, { addSuffix: true }),
      expandedDate: formatDate(
        video.createdAt,
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        },
        " "
      ),
    };
  }, [video.createdAt, video.viewCount]);

  return (
    <div className="flex flex-col gap-4 mt-4">
      <h1 className="text-xl font-semibold">{video.title}</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <VideoOwner user={video.user} videoId={video.id} />
        <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2">
          <VideoReactions
            videoId={video.id}
            likeCount={video.likeCount}
            dislikeCount={video.dislikeCount}
            viewerReaction={video.viewerReaction}
          />
          <VideoMenus videoId={video.id} variant="secondary" />
        </div>
      </div>
      <VideoDescription
        compactViews={viewsAndDates.compactViews}
        expandedViews={viewsAndDates.expandedViews}
        compactDate={viewsAndDates.compactDate}
        expandedDate={viewsAndDates.expandedDate}
        description={video.description}
      />
    </div>
  );
};
