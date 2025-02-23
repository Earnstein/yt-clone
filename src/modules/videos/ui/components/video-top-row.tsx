import { TGetOneVideoOutput } from "../../types";
import { VideoMenus } from "./video-menus";
import { VideoOwner } from "./video-owner";
import { VideoReactions } from "./video-reactions";

interface VideoTopRowProps {
  video: TGetOneVideoOutput;
}

export const VideoTopRow: React.FC<VideoTopRowProps> = ({ video }) => {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <h1 className="text-xl font-semibold">{video.title}</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <VideoOwner user={video.user} videoId={video.id} />
        <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2">
          <VideoReactions />
          <VideoMenus videoId={video.id} variant="secondary" />
        </div>
      </div>
    </div>
  );
};
