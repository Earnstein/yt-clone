"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";

import { DEFAULT_LIMIT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TPlaylists } from "@/modules/playlist/types";
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

const getPlaylistName = (playlistId: string, playlists: TPlaylists) => {
  return playlists.find((playlist) => playlist.id === playlistId)?.name;
};

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  open,
  setOpen,
  videoId,
}) => {
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

  const utils = trpc.useUtils();

  const addMutation = trpc.playlist.addToPlaylist.useMutation({
    onSuccess: () => {
      toast.success(
        `Added to ${getPlaylistName(
          addMutation.variables!.playlistId,
          playlists!.pages.flatMap((page) => page.items)
        )}`
      );
      utils.playlist.getPlaylistsForVideos.invalidate({
        videoId,
      });
    },
    onSettled: () => {
      utils.playlist.getPlaylistsForVideos.invalidate({
        videoId,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeMutation = trpc.playlist.removeFromPlaylist.useMutation({
    onSuccess: () => {
      toast.success(
        `Removed from ${getPlaylistName(
          removeMutation.variables!.playlistId,
          playlists!.pages.flatMap((page) => page.items)
        )}`
      );
      utils.playlist.getPlaylistsForVideos.invalidate({
        videoId,
      });
    },
    onSettled: () => {
      utils.playlist.getPlaylistsForVideos.invalidate({
        videoId,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return (
    <ResponsiveModal
      open={open}
      title="Save to playlist"
      onOpenChange={setOpen}
      className="w-full max-w-xs"
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
                    removeMutation.mutate({
                      playlistId: playlist.id,
                      videoId,
                    });
                  } else {
                    addMutation.mutate({
                      playlistId: playlist.id,
                      videoId,
                    });
                  }
                }}
                disabled={
                  (addMutation.variables?.playlistId === playlist.id &&
                    addMutation.isPending) ||
                  (removeMutation.variables?.playlistId === playlist.id &&
                    removeMutation.isPending)
                }
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
