import { Skeleton } from "@/components/ui/skeleton";
import { THUMBNAIL_PLACEHOLDER_URL } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";
import Image from "next/image";

interface PlaylistThumbnailProps {
  thumbnailUrl?: string | null;
  previewUrl?: string | null;
  title: string;
  duration: number;
}
export const PlaylistThumbnailSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl aspect-video">
      <Skeleton className="size-full" />
    </div>
  );
};
export const PlaylistThumbnail: React.FC<PlaylistThumbnailProps> = ({
  thumbnailUrl,
  previewUrl,
  title,
  duration,
}) => {
  return (
    <div className="relative group">
      {/*Thumbnail wrapper*/}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          loader={({ src }) => src || THUMBNAIL_PLACEHOLDER_URL}
          src={thumbnailUrl || THUMBNAIL_PLACEHOLDER_URL}
          alt={title}
          fill
          sizes="33vw"
          className="object-cover size-full group-hover:opacity-0"
          priority
        />
        <Image
          loader={({ src }) => src || THUMBNAIL_PLACEHOLDER_URL}
          src={previewUrl || thumbnailUrl || THUMBNAIL_PLACEHOLDER_URL}
          alt={title}
          fill
          sizes="33vw"
          className="object-cover size-full opacity-0 group-hover:opacity-100"
          loading="lazy"
        />
      </div>

      {/*Video duration box*/}
      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium rounded">
        {formatDuration(duration)}
      </div>

      {/* TODO: Add video duration box*/}
    </div>
  );
};
