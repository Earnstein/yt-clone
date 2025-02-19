import { ResponsiveModal } from "@/components/responsive-modal";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface ThumbnailUploadModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ThumbnailUploadModal: React.FC<ThumbnailUploadModalProps> = ({
  videoId,
  open,
  onOpenChange,
}) => {
  const utils = trpc.useUtils();
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Upload a Thumbnail"
    >
      <UploadDropzone
        endpoint="imageUploader"
        input={{ videoId }}
        onClientUploadComplete={() => {
          utils.studio.getVideoById.invalidate({ id: videoId });
          utils.studio.getAllVideos.invalidate();
          onOpenChange(false);
          toast.success("Thumbnail uploaded successfully");
        }}
      />
    </ResponsiveModal>
  );
};
