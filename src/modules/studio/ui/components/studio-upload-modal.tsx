"use client";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { PlusIcon } from "lucide-react";
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
        open={!!mutation.data}
        title="Upload Video"
        description="Upload a video to your channel"
        onOpenChange={() => {
          mutation.reset();
        }}
      >
        <div>...</div>
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
