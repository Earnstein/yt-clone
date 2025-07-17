import { Button, ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { APP_URL } from "@/lib/constants";
import {
  EllipsisVerticalIcon,
  ListPlusIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { AddToPlaylistModal } from "./add-to-playlist-modal";

interface VideoMenuProps {
  videoId: string;
  variant?: ButtonProps["variant"];
  onRemove?: () => void;
  isPending?: boolean;
}

// TODO: Add a playlist menu item
export const VideoMenus: React.FC<VideoMenuProps> = ({
  videoId,
  variant = "ghost",
  onRemove,
  isPending,
}) => {
  const [openPlaylistModal, setOpenPlaylistModal] = useState(false);
  const { copyToClipboard } = useCopyToClipboard({
    timeout: 2000,
    onCopy: () => {
      toast.success("Link copied to clipboard");
    },
  });

  const onShare = () => {
    const url = `${APP_URL}/videos/${videoId}`;

    copyToClipboard(url);
  };

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size="icon" className="rounded-full">
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={onShare}>
            <ShareIcon className="mr-2 size-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenPlaylistModal(true)}>
            <ListPlusIcon className="mr-2 size-4" />
            Add to playlist
          </DropdownMenuItem>

          {onRemove && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onRemove} disabled={isPending}>
                <Trash2Icon className="mr-2 size-4" />
                Remove
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AddToPlaylistModal
        open={openPlaylistModal}
        setOpen={setOpenPlaylistModal}
        videoId={videoId}
      />
    </Fragment>
  );
};
