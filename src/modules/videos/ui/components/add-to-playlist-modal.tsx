"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";

import { DEFAULT_LIMIT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import {
  Loader2Icon,
  LockIcon,
  LockOpenIcon,
  SquareCheckIcon,
  SquareIcon,
} from "lucide-react";
import { toast } from "sonner";

interface AddToPlaylistModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  videoId: string;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  open,
  setOpen,
  videoId,
}) => {
  const utils = trpc.useUtils();

  const {
    data: playlists,
    isLoading: isPlaylistsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = trpc.playlist.getPlaylistsForVideos.useInfiniteQuery(
    {
      videoId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!videoId && open,
    }
  );

  const addMutation = trpc.playlist.addToPlaylist.useMutation({
    onSuccess: () => {
      utils.playlist.getPlaylistsForVideos.invalidate({
        videoId,
      });
    },
    onSettled: () => {
      utils.playlist.getPlaylists.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeMutation = trpc.playlist.removeFromPlaylist.useMutation({
    onSuccess: () => {
      utils.playlist.getPlaylistsForVideos.invalidate({
        videoId,
      });
    },
    onSettled: () => {
      utils.playlist.getPlaylists.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAddToPlaylist = (playlistId: string, playlistName: string) => {
    return addMutation.mutate(
      { playlistId, videoId },
      {
        onSuccess: () => {
          toast.success(`Added to ${playlistName}`);
        },
      }
    );
  };

  const handleRemoveFromPlaylist = (
    playlistId: string,
    playlistName: string
  ) => {
    return removeMutation.mutate(
      { playlistId, videoId },
      {
        onSuccess: () => {
          toast.success(`Removed from ${playlistName}`);
        },
      }
    );
  };

  const isPlaylistPending = (playlistId: string) => {
    return (
      (addMutation.variables?.playlistId === playlistId &&
        addMutation.isPending) ||
      (removeMutation.variables?.playlistId === playlistId &&
        removeMutation.isPending)
    );
  };

  return (
    <ResponsiveModal
      open={open}
      title="Save to playlist"
      onOpenChange={setOpen}
      className="w-full md:max-w-xs"
    >
      <div>
        {isPlaylistsLoading && (
          <div className="flex justify-center p-4">
            <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isPlaylistsLoading && playlists && playlists.pages.length === 0 && (
          <div>No playlists found</div>
        )}

        {!isPlaylistsLoading &&
          playlists &&
          playlists.pages
            .flatMap((page) => page.items)
            .map((playlist) => (
              <Button
                key={playlist.id}
                className="w-full justify-start [&_svg]:size-4 px-2"
                variant="ghost"
                size="lg"
                onClick={() => {
                  if (playlist.isInPlaylist) {
                    handleRemoveFromPlaylist(playlist.id, playlist.name);
                  } else {
                    handleAddToPlaylist(playlist.id, playlist.name);
                  }
                }}
                disabled={isPlaylistPending(playlist.id)}
              >
                {playlist.isInPlaylist ? (
                  <SquareCheckIcon
                    className={cn(
                      "mr-2",
                      playlist.isInPlaylist && "text-primary"
                    )}
                  />
                ) : (
                  <SquareIcon className="mr-2" />
                )}
                {playlist.name}

                {playlist.visibility === "private" ? (
                  <LockIcon className="ml-auto size-4 text-muted-foreground" />
                ) : (
                  <LockOpenIcon className="ml-auto size-4 text-muted-foreground" />
                )}
              </Button>
            ))}

        {!isPlaylistsLoading && (
          <InfiniteScroll
            hasNextPage={hasNextPage}
            ifFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            isManual={true}
          />
        )}
      </div>
    </ResponsiveModal>
  );
};
