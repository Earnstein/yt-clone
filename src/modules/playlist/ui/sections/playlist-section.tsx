"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { trpc } from "@/trpc/client";
import { Fragment, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import {
  PlaylistGridCard,
  PlaylistGridCardSkeleton,
} from "../components/playlist-grid-card";
import {
  PlaylistRowCard,
  PlaylistRowCardSkeleton,
} from "../components/playlist-row-card";

interface PlaylistSectionProps {
  playlistId: string;
}
const PlaylistSectionSkeleton = () => {
  return (
    <Fragment>
      <div className="hidden flex-col gap-y-4 md:flex">
        {Array.from({ length: 4 }).map((_, index) => (
          <PlaylistRowCardSkeleton key={index} size="compact" />
        ))}
      </div>
      <div className="flex flex-col gap-y-4 md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <PlaylistGridCardSkeleton key={index} />
        ))}
      </div>
    </Fragment>
  );
};
const PlaylistSectionSuspense: React.FC<PlaylistSectionProps> = ({
  playlistId,
}) => {
  const utils = trpc.useUtils();

  const [playlist, resultsQuery] =
    trpc.playlist.getPlaylistVideos.useSuspenseInfiniteQuery(
      {
        playlistId,
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const removeFromPlaylistMutation =
    trpc.playlist.removeFromPlaylist.useMutation({
      onMutate: async ({ playlistId, videoId }) => {
        //cancel outgoing request
        await utils.playlist.getPlaylistVideos.cancel();

        // get the playlist items
        const playlist = utils.playlist.getPlaylistVideos.getInfiniteData({
          playlistId,
          limit: DEFAULT_LIMIT,
        });

        const previousPlaylist = playlist?.pages.flatMap((page) => page.items);

        //if the playlist is not found, return the previous playlist items
        if (!previousPlaylist) {
          return { previousPlaylist };
        }

        const deletedPlaylist = previousPlaylist.filter(
          (item) => item.video.id !== videoId
        );
        utils.playlist.getPlaylistVideos.setInfiniteData(
          {
            playlistId,
            limit: DEFAULT_LIMIT,
          },
          {
            pages: [
              {
                items: deletedPlaylist,
                nextCursor: playlist?.pages[0]?.nextCursor ?? null,
              },
            ],
            pageParams: [null],
          }
        );

        return { previousPlaylist };
      },
      onSuccess: () => {
        utils.playlist.getPlaylistVideos.invalidate();
      },
      onError: (error, _, context) => {
        if (context?.previousPlaylist) {
          utils.playlist.getPlaylistVideos.setInfiniteData(
            {
              playlistId,
              limit: DEFAULT_LIMIT,
            },
            {
              pages: [
                {
                  items: context.previousPlaylist,
                  nextCursor: playlist?.pages[0]?.nextCursor ?? null,
                },
              ],
              pageParams: [null],
            }
          );
        }

        toast.error(error.message || "Failed to remove video from playlist");
      },
    });

  const playlistVideos = playlist.pages.flatMap((page) => page.items);
  const handleRemoveFromPlaylist = (
    playlistName: string,
    videoName: string,
    playlistId: string,
    videoId: string
  ) => {
    removeFromPlaylistMutation.mutate(
      { playlistId, videoId },
      {
        onSuccess: () => {
          toast.success(`${videoName} removed from ${playlistName}`);
        },
        onError: () => {
          toast.error(`Failed to remove ${videoName} from ${playlistName}`);
        },
      }
    );
  };

  return (
    <Fragment>
      <div className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-bold">{playlistVideos[0].name}</h1>
        <p className="text-sm text-muted-foreground">
          {playlistVideos[0].description ?? "Videos in your playlist"}
        </p>
      </div>
      <div className="hidden flex-col gap-y-4 md:flex">
        {playlistVideos.map((playlist) => (
          <PlaylistRowCard
            key={playlist.video.id}
            playlist={playlist}
            size="compact"
            onRemove={() =>
              handleRemoveFromPlaylist(
                playlist.name,
                playlist.video.title,
                playlistId,
                playlist.video.id
              )
            }
            isPending={removeFromPlaylistMutation.isPending}
          />
        ))}
      </div>
      <div className="flex flex-col gap-y-4 md:hidden">
        {playlistVideos.map((playlist) => (
          <PlaylistGridCard
            key={playlist.video.id}
            playlist={playlist}
            onRemove={() =>
              handleRemoveFromPlaylist(
                playlist.name,
                playlist.video.title,
                playlistId,
                playlist.video.id
              )
            }
            isPending={removeFromPlaylistMutation.isPending}
          />
        ))}
      </div>

      <InfiniteScroll
        hasNextPage={resultsQuery.hasNextPage}
        ifFetchingNextPage={resultsQuery.isFetchingNextPage}
        fetchNextPage={resultsQuery.fetchNextPage}
      />
    </Fragment>
  );
};

export const PlaylistSection: React.FC<PlaylistSectionProps> = ({
  playlistId,
}) => {
  return (
    <Suspense fallback={<PlaylistSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <PlaylistSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};
