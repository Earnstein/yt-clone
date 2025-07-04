import { CommentsSection } from "../sections/comments-sections";
import { SuggestionsSection } from "../sections/suggestions-sections";
import { VideoSection } from "../sections/video-section";

interface VideoViewProps {
  videoId: string;
}

export const VideoView: React.FC<VideoViewProps> = ({ videoId }) => {
  return (
    <div className="flex flex-col max-w-[1700px] mx-auto pt-2.5 px-4 mb-10">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <VideoSection videoId={videoId} />
          <CommentsSection videoId={videoId} />
          <div className="xl:hidden block mt-4">
            <SuggestionsSection videoId={videoId} isManual />
          </div>
        </div>
        <div className="hidden xl:block w-full xl:w-[380px] 2xl:w-[460px] shrink-1">
          <SuggestionsSection videoId={videoId} />
        </div>
      </div>
    </div>
  );
};
