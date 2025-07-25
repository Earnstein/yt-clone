import { ResponsiveModal } from "@/components/responsive-modal";
import { StudioUploader } from "@/components/studio-uploader";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2Icon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

interface StudioUploadVideoProps {
  videoId: string;
}

export const StudioUploadVideoModal = ({ videoId }: StudioUploadVideoProps) => {
  const mutation = trpc.videos.uploadVideo.useMutation({
    onMutate: () => {
      toast.info("Preparing your video uploader...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Proceed to upload video");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
      utils.studio.getAllVideos.invalidate();
      utils.studio.getVideoById.invalidate({ id: videoId });
    },
  });
  const utils = trpc.useUtils();

  const isUploading = (videoId: string): boolean => {
    return mutation.isPending && mutation.variables?.videoId === videoId;
  };

  const handleUploadSuccess = () => {
    mutation.reset();
    utils.studio.getAllVideos.invalidate();
    utils.studio.getVideoById.invalidate({ id: videoId });

    // invalidate the query after 4 seconds after webhook is received
    setTimeout(() => {
      utils.studio.getAllVideos.invalidate();
      utils.studio.getVideoById.invalidate({ id: videoId });
    }, 5000);
  };
  return (
    <>
      <ResponsiveModal
        open={!!mutation.data?.url}
        title="Upload Video"
        description="Upload a video to your channel"
        onOpenChange={() => {
          mutation.reset();
          utils.studio.getAllVideos.invalidate();
        }}
      >
        {mutation.data?.url ? (
          <StudioUploader
            endpoint={mutation.data.url}
            onSuccess={handleUploadSuccess}
          />
        ) : (
          <Loader2Icon className="animate-spin size-4" />
        )}
      </ResponsiveModal>
      <Button
        variant="outline"
        size="sm"
        disabled={isUploading(videoId)}
        onClick={() => {
          mutation.mutate({ videoId });
        }}
      >
        {isUploading(videoId) ? (
          <Loader2Icon className="animate-spin size-4" />
        ) : (
          <UploadIcon className="size-4" />
        )}
        upload video
      </Button>
    </>
  );
};
