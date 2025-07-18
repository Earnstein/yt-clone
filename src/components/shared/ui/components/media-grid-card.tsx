import {
  VideoThumbnail,
  VideoThumbnailSkeleton,
} from "@/modules/videos/ui/components/video-thumbnail";
import Link from "next/link";
import { MediaItem } from "../../types/media";
import { MediaInfo, MediaInfoSkeleton } from "./media-info";

interface MediaGridCardProps {
  item: MediaItem;
  onRemove?: () => void;
  isPending?: boolean;
}

export const MediaGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <VideoThumbnailSkeleton />
      <MediaInfoSkeleton />
    </div>
  );
};

export const MediaGridCard: React.FC<MediaGridCardProps> = ({
  item,
  onRemove,
  isPending,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <Link href={`/videos/${item.id}`}>
        <VideoThumbnail
          thumbnailUrl={item.thumbnailUrl}
          title={item.title}
          duration={item.duration ?? 0}
          previewUrl={item.previewUrl}
        />
      </Link>

      <MediaInfo item={item} onRemove={onRemove} isPending={isPending} />
    </div>
  );
};
