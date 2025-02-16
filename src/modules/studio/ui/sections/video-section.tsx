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
import { trpc } from "@/trpc/client";
import { Loader2Icon, UploadIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

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
          <StudioUploader
            endpoint={mutation.data.url}
            onSuccess={() => {
              mutation.reset();
              utils.studio.getAllVideos.invalidate();
            }}
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
                <TableHead className="pl-6 w-[300px]">Video</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
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
                    <TableCell className="p-0">
                      <Link
                        href={`/studio/videos/${video.id}`}
                        className="block px-6 py-4"
                      >
                        {video.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/studio/videos/${video.id}`}
                        className="block py-4"
                      >
                        visibility
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/studio/videos/${video.id}`}
                        className="block py-4"
                      >
                        status
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/studio/videos/${video.id}`}
                        className="block py-4"
                      >
                        date
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/studio/videos/${video.id}`}
                        className="block py-4"
                      >
                        views
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/studio/videos/${video.id}`}
                        className="block py-4"
                      >
                        comments
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/studio/videos/${video.id}`}>likes</Link>
                    </TableCell>
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
            isManual
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
