import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { TPlaylists } from "@/modules/playlist/types";
import { EditPlaylistModal } from "@/modules/videos/ui/components/edit-playlist-modal";
import { trpc } from "@/trpc/client";
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";

interface PlaylistInfoProps {
  playlist: TPlaylists[number];
}

export const PlaylistInfoSkeleton = () => {
  return (
    <div className="flex gap-3">
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[70%]" />
        <Skeleton className="h-4 w-[50%]" />
      </div>
    </div>
  );
};

export const PlaylistInfo: React.FC<PlaylistInfoProps> = ({ playlist }) => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const deletePlaylist = trpc.playlist.deletePlaylist.useMutation({
    onSuccess: ({ deletedPlaylist }) => {
      toast.success(`${deletedPlaylist.name} playlist deleted successfully`);
      utils.playlist.getPlaylists.invalidate();
    },
    onError: ({ message }) => {
      toast.error(message || "Something went wrong");
    },
  });

  const handleDeletePlaylist = () => {
    return deletePlaylist.mutate({
      playlistId: playlist.id,
    });
  };

  return (
    <Fragment>
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium line-clamp-1 lg:line-clamp-2 break-words">
            {playlist.name}
          </h3>
          <p className="text-xs text-muted-foreground">Playlist</p>
          <p className="text-xs text-muted-foreground group-hover:text-primary">
            View full playlist
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <EllipsisVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <PencilIcon className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDeletePlaylist}>
              <Trash2Icon className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <EditPlaylistModal open={open} setOpen={setOpen} playlist={playlist} />
    </Fragment>
  );
};
