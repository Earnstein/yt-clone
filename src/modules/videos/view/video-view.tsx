import { VideoSection } from "../ui/components/sections/video-section";

interface VideoViewProps {
  videoId: string;
}

export const VideoView: React.FC<VideoViewProps> = async ({ videoId }) => {
  return (
    <div className="px-4 pt-2.5 container">
      <VideoSection videoId={videoId} />
    </div>
  );
};
