import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Edit2Icon } from "lucide-react";
import { useState } from "react";
import { TGetOneUserOutput } from "../../types";
import { UserBannerUploadModal } from "./user-banner-upload-modal";

interface UserProps {
  user: TGetOneUserOutput;
}

export const UserBannerSkeleton = () => {
  return (
    <Skeleton className="w-full max-h-[200px] h-[15vh] md:h-[25vh] rounded-xl" />
  );
};

export const UserBanner: React.FC<UserProps> = ({ user }) => {
  const { userId } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <>
      <UserBannerUploadModal
        userId={user.id}
        open={open}
        onOpenChange={setOpen}
      />

      <div className="relative group">
        <div
          className={cn(
            "w-full max-h-[200px] h-[15vh] md:h-[25vh] bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl",
            user.bannerUrl ? "bg-cover bg-center" : "bg-gray-100"
          )}
          style={{
            backgroundImage: user.bannerUrl
              ? `url(${user.bannerUrl})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {user.id === userId && (
            <Button
              type="button"
              size="icon"
              className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/70 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={() => setOpen(true)}
            >
              <Edit2Icon className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
