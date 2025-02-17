"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
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
import { cn, formatDate, snakeCaseToTitleCase } from "@/lib/utils";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";
import { trpc } from "@/trpc/client";
import { Globe2Icon, LockIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import VideoStatusBadge from "../components/studio-badge-status";
import { StudioUploadVideoModal } from "../components/studio-upload-video";

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
                  <Skeleton
                    className={cn(
                      "w-full h-6 rounded-none",
                      cellIndex === 0 && "size-24 rounded-md"
                    )}
                  />
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

  return (
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
                      <VideoStatusBadge
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
                    <StudioUploadVideoModal videoId={video.id} />
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
