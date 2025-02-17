"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveModal } from "@/components/responsive-modal";
import { StudioUploader } from "@/components/studio-uploader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { formatDate, snakeCaseToTitleCase } from "@/lib/utils";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";
import { trpc } from "@/trpc/client";
import { Globe2Icon, Loader2Icon, LockIcon, UploadIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import StudioBadgeStatus from "../components/studio-badge-status";

const VideoSectionSkeleton = () => {
  const headers = [
    { label: "Video", className: "pl-6 w-[510px]" },
    { label: "Visibility" },
    { label: "Status" },
    { label: "Date" },
    { label: "Views", className: "text-right" },
    { label: "Comments", className: "text-right" },
    { label: "Likes", className: "pr-6 text-right" },
  ];

  return (
    <div className="divide-y">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index} className={header.className}>
                {header.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, rowIndex) => (
            <TableRow key={rowIndex} className="animate-pulse">
              {headers.map((_, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton className="w-full h-6 rounded-none" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const VideoSectionSuspense = () => {
  const [videos, query] = trpc.studio.getAllVideos.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
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
  });
  const utils = trpc.useUtils();

  const isUploading = (videoId: string): boolean => {
    return mutation.isPending && mutation.variables?.videoId === videoId;
  };

  const handleUploadSuccess = () => {
    mutation.reset();
    utils.studio.getAllVideos.invalidate();

    // invalidate the query after 4 seconds after webhook is received
    setTimeout(() => {
      utils.studio.getAllVideos.invalidate();
    }, 4000);
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
      <div>
        <div className="divide-y">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 w-[500px]">Video</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Date</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Comments</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.pages.flatMap((page) =>
                page.items.map((video) => (
                  <TableRow key={video.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Link href={`/studio/videos/${video.id}`}>
                        <div className="flex items-center gap-4">
                          <div className="relative size-36 aspect-video shrink-0 place-content-center">
                            <VideoThumbnail
                              thumbnailUrl={video.thumbnailUrl}
                              previewUrl={video.previewUrl}
                              title={video.title}
                              duration={video.duration}
                            />
                          </div>

                          <div className="flex flex-col gap-1 overflow-hidden">
                            <span className="text-sm line-clamp-1">
                              {video.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {video.description || "No description"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-2">
                        {video.visibility === "public" ? (
                          <Globe2Icon className="size-4" />
                        ) : (
                          <LockIcon className="size-4" />
                        )}
                        {snakeCaseToTitleCase(video.visibility)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {video.muxStatus ? (
                        <StudioBadgeStatus
                          status={snakeCaseToTitleCase(video.muxStatus)}
                        />
                      ) : (
                        "_ _"
                      )}
                    </TableCell>
                    <TableCell className="truncate">
                      {formatDate(
                        video.createdAt,
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                        " "
                      )}
                    </TableCell>
                    <TableCell className="text-right">views</TableCell>
                    <TableCell className="text-right">comments</TableCell>
                    <TableCell className="text-right">likes</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUploading(video.id)}
                        onClick={() => {
                          mutation.mutate({ videoId: video.id });
                        }}
                      >
                        {isUploading(video.id) ? (
                          <Loader2Icon className="animate-spin size-4" />
                        ) : (
                          <UploadIcon className="size-4" />
                        )}
                        upload video
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {videos.pages[0].items.length === 0 ? (
          <p className="mt-24 text-xs text-center text-muted-foreground">
            You haven&apos;t uploaded any videos yet.
          </p>
        ) : (
          <InfiniteScroll
            hasNextPage={query.hasNextPage}
            ifFetchingNextPage={query.isFetchingNextPage}
            fetchNextPage={query.fetchNextPage}
          />
        )}
      </div>
    </>
  );
};

export const VideoSection = () => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <VideoSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};
