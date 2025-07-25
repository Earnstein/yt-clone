import { ResponsiveModal } from "@/components/responsive-modal";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface UserBannerUploadModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserBannerUploadModal: React.FC<UserBannerUploadModalProps> = ({
  userId,
  open,
  onOpenChange,
}) => {
  const utils = trpc.useUtils();
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Upload a Banner"
    >
      <UploadDropzone
        endpoint="userBannerUploader"
        input={{ userId }}
        onClientUploadComplete={() => {
          utils.users.getOne.invalidate({ id: userId });
          onOpenChange(false);
          toast.success("Banner uploaded successfully");
        }}
      />
    </ResponsiveModal>
  );
};
