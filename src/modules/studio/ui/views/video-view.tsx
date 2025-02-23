import { VideoSection } from "../sections/video-section";

interface VideoViewProps {
  videoId: string;
}

export const VideoView: React.FC<VideoViewProps> = async ({ videoId }) => {
  return (
    <div className="px-4 pt-2.5 max-w-[1700px] mx-auto">
      <VideoSection videoId={videoId} />
    </div>
  );
};
