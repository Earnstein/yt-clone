import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MuxPlayer from "@mux/mux-player-react";
import Image from "next/image";

interface VideoPlayerProps {
  playbackId?: string | null | undefined;
  thumbnailUrl?: string | null | undefined;
  autoPlay?: boolean;
  onPlay?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  playbackId,
  thumbnailUrl,
  autoPlay,
  onPlay,
}) => {
  if (!playbackId) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Image
              src="/placeholder.svg"
              alt="No video found"
              width={100}
              height={100}
              className="size-full object-contain"
            />
          </TooltipTrigger>
          <TooltipContent className="bg-secondary text-secondary-foreground">
            No video found 🎥
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <MuxPlayer
      playbackId={playbackId}
      thumbnailTime={0}
      poster={thumbnailUrl || "/placeholder.svg"}
      autoPlay={autoPlay}
      onPlay={onPlay}
      className="size-full object-contain"
      accentColor="#FF2056"
    />
  );
};
