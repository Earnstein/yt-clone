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
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

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
  return (
    <div>
      <div className="divide-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="pr-6 text-right">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.pages.flatMap((page) =>
              page.items.map((video) => (
                <Link
                  href={`/studio/videos/${video.id}`}
                  key={video.id}
                  legacyBehavior
                >
                  <TableRow className="cursor-pointer hover:bg-muted/50">
                    <TableCell>{video.title}</TableCell>
                    <TableCell>visibility</TableCell>
                    <TableCell>status</TableCell>
                    <TableCell>date</TableCell>
                    <TableCell className="text-right">views</TableCell>
                    <TableCell className="text-right">comments</TableCell>
                    <TableCell className="pr-6 text-right">likes</TableCell>
                  </TableRow>
                </Link>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        ifFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
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
