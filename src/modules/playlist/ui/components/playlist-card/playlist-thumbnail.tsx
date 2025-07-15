import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { THUMBNAIL_PLACEHOLDER_URL } from "@/lib/constants";
import { cn, formatNumber } from "@/lib/utils";
import { ListVideoIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

interface PlaylistThumbnailProps {
  imageUrl?: string;
  title: string;
  videoCount: number;
  className?: string;
}

export const PlaylistThumbnailSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl aspect-video">
      <Skeleton className="size-full" />
    </div>
  );
};

export const PlaylistThumbnail: React.FC<PlaylistThumbnailProps> = ({
  imageUrl = THUMBNAIL_PLACEHOLDER_URL,
  title,
  videoCount,
  className,
}) => {
  const memoizedCount = useMemo(() => {
    return {
      compactCount: formatNumber(videoCount, { notation: "compact" }),
    };
  }, [videoCount]);
  return (
    <div className={cn("relative pt-3", className)}>
      {/* STACK EFFECT CARD LAYOUT */}
      <div className="relative">
        {/* Background layer */}
        <div className="absolute -top-3 left-[54%] -translate-x-1/2 w-[97.5%] overflow-hidden rounded-xl bg-black/20 aspect-video" />
        <div className="absolute -top-1.5 left-[53%] -translate-x-1/2 w-[98%] overflow-hidden rounded-xl bg-black/25 aspect-video" />

        {/* Image */}
        <AspectRatio
          ratio={16 / 9}
          className="relative overflow-hidden rounded-xl"
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover size-full"
          />

          {/* Hover effect */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex items-center gap-x-2">
              <PlayIcon className="size-4 fill-white text-white" />
              <span className="text-sm font-medium text-white">Play all</span>
            </div>
          </div>
        </AspectRatio>
      </div>

      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium flex items-center gap-x-1">
        <ListVideoIcon className="size-4" />
        <span> {memoizedCount.compactCount} videos</span>
      </div>
    </div>
  );
};
