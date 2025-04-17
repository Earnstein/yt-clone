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
