"use client";
import { ResponsiveModal } from "@/components/responsive-modal";
import { StudioUploader } from "@/components/studio-uploader";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

export const StudioUploadModal = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.videos.createVideo.useMutation({
    onSuccess: () => {
      toast.success("Video created successfully");

      utils.studio.getAllVideos.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <ResponsiveModal
        open={!!mutation.data?.url}
        title="Upload Video"
        description="Upload a video to your channel"
        onOpenChange={() => {
          mutation.reset();
        }}
      >
        {mutation.data?.url ? (
          <StudioUploader endpoint={mutation.data.url} onSuccess={() => {}} />
        ) : (
          <Loader2Icon className="animate-spin size-4" />
        )}
      </ResponsiveModal>
      <Button
        variant="secondary"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        isLoading={mutation.isPending}
      >
        {!mutation.isPending && <PlusIcon className="size-4" />}
        {mutation.isPending ? "Creating..." : "Create"}
      </Button>
    </>
  );
};
