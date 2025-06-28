"use client";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { videoUpdateSchema } from "@/db/schema";
import { TUpdateVideo } from "@/db/types";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { APP_URL, THUMBNAIL_PLACEHOLDER_URL } from "@/lib/constants";
import { cn, snakeCaseToTitleCase } from "@/lib/utils";
import VideoStatusBadge from "@/modules/studio/ui/components/studio-badge-status";
import { ThumbnailUploadModal } from "@/modules/studio/ui/components/thumbnail-upload-modal";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckIcon,
  CopyIcon,
  EllipsisVertical,
  Globe2Icon,
  ImagePlusIcon,
  Loader2,
  LockIcon,
  RefreshCcwIcon,
  RotateCcwIcon,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface VideoSectionProps {
  videoId: string;
}
const VideoSkeleton = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[70px]" />
          <Button variant="ghost" size="icon" disabled>
            <EllipsisVertical className="text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="space-y-8 col-span-1 lg:col-span-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-[60px]" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-[250px] w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-[80px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="space-y-8 col-span-1 lg:col-span-2">
          <Card className="bg-[#F9F9F9]">
            <AspectRatio ratio={16 / 9}>
              <Skeleton className="h-full w-full rounded-none" />
            </AspectRatio>
            <div className="p-4 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>

              <div className="space-y-1">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-6 w-[120px]" />
              </div>

              <div className="space-y-1">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-6 w-[120px]" />
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
const VideoSectionSuspense: React.FC<VideoSectionProps> = ({ videoId }) => {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const utils = trpc.useUtils();
  const { copyToClipboard, isCopied } = useCopyToClipboard({
    timeout: 2000,
    onCopy: () => {
      toast.success("Video URL copied to clipboard");
    },
  });

  // Queries
  const [video] = trpc.studio.getVideoById.useSuspenseQuery({ id: videoId });
  const categories = trpc.categories.getAll.useQuery();

  // Mutations
  const updateVideoMutation = trpc.videos.updateVideo.useMutation({
    onSuccess: () => {
      toast.success("Video updated successfully");
      utils.studio.getAllVideos.invalidate();
      utils.studio.getVideoById.invalidate({ id: videoId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const restoreThumbnailMutation = trpc.videos.restoreThumbnail.useMutation({
    onMutate: () => {
      utils.studio.getVideoById.cancel({ id: videoId });
      toast.loading(`Restoring thumbnail....`);
    },
    onSuccess: () => {
      toast.dismiss();
      utils.studio.getAllVideos.invalidate();
      utils.studio.getVideoById.invalidate({ id: videoId });
      toast.success("Thumbnail updated successfully");
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(error.message);
    },
  });

  const deleteVideoMutation = trpc.videos.deleteVideo.useMutation({
    onMutate: () => {
      utils.studio.getVideoById.cancel({ id: videoId });
      toast.loading(`Deleting ${video.title}....`);
    },
    onSuccess: (data) => {
      utils.studio.getAllVideos.invalidate();
      toast.dismiss();
      toast.success(data.message);
      router.push("/studio");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const revalidateVideoMutation = trpc.videos.revalidate.useMutation({
    onMutate: () => {
      utils.studio.getVideoById.cancel({ id: videoId });
      toast.loading("Loading video...");
    },
    onSuccess: () => {
      utils.studio.getAllVideos.invalidate();
      toast.dismiss();
      toast.success("success");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      utils.studio.getVideoById.invalidate({ id: videoId });
    },
  });
  // Form
  const form = useForm<TUpdateVideo>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });

  const onSubmit = (data: TUpdateVideo) => {
    updateVideoMutation.mutate(data);
  };

  const url = `${APP_URL}/videos/${videoId}`;

  const renderCategoryList = () => {
    if (categories.isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="w-full h-8 rounded-none" />
          ))}
        </div>
      );
    }

    if (categories.isError) {
      return (
        <div className="space-y-1 border-b border-neutral-200 text-xs text-muted-foreground">
          <p className="text-body-2">Error loading categories</p>
          <p className="text-body-2 text-destructive">
            {categories.error.data?.httpStatus}: {categories.error.message}
          </p>
        </div>
      );
    }

    if (!categories?.data?.length) {
      return (
        <div className="space-y-1 border-b border-neutral-200">
          <SelectItem value="none" disabled>
            No categories available
          </SelectItem>
        </div>
      );
    }

    return categories.data.map((category) => (
      <SelectItem key={category.id} value={category.id}>
        <span className="text-body-2">{category.name}</span>
      </SelectItem>
    ));
  };
  return (
    <>
      <ThumbnailUploadModal
        videoId={videoId}
        open={open}
        onOpenChange={setOpen}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="md:pr-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Video details</h1>
              <p className="text-sm text-muted-foreground">
                Manage your video details.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={updateVideoMutation.isPending}
                isLoading={updateVideoMutation.isPending}
              >
                {updateVideoMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <EllipsisVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => revalidateVideoMutation.mutate({ videoId })}
                    disabled={revalidateVideoMutation.isPending}
                  >
                    {revalidateVideoMutation.isPending ? (
                      <Loader2 className="size-4 mr-2 motion-preset-spin motion-duration-1500" />
                    ) : (
                      <RefreshCcwIcon className="size-4 mr-2" />
                    )}
                    {revalidateVideoMutation.isPending
                      ? "Loading..."
                      : "Revalidate"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => deleteVideoMutation.mutate({ id: videoId })}
                    disabled={deleteVideoMutation.isPending}
                  >
                    {deleteVideoMutation.isPending ? (
                      <Loader2 className="size-4 mr-2 motion-preset-spin motion-duration-1500" />
                    ) : (
                      <TrashIcon className="size-4 mr-2" />
                    )}
                    {deleteVideoMutation.isPending ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className=" space-y-8 col-span-1 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title
                      {/* TODO: Add AI generate button */}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Edit your video title" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description
                      {/* TODO: Add AI generate button */}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        rows={10}
                        className="resize-none pr-10"
                        placeholder="Edit your video description"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* TODO: Add thumbnail field here */}
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <FormControl>
                      <div className="border border-dashed p-0.5 border-neutral-400 relative h-[84px] w-[153px] group">
                        <Image
                          loader={({ src }) => src}
                          src={video.thumbnailUrl || THUMBNAIL_PLACEHOLDER_URL}
                          alt="Thumbnail"
                          fill
                          className="object-cover"
                        />

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="bg-black/50 hover:bg-black/70 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                              <EllipsisVertical className="text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right">
                            <DropdownMenuItem
                              className="group"
                              onClick={() => setOpen(true)}
                              disabled={!video.muxPlaybackId}
                            >
                              <ImagePlusIcon className="size-4 mr-1 group-hover:motion-preset-bounce" />
                              Change
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="group"
                              disabled={
                                restoreThumbnailMutation.isPending ||
                                !video.muxPlaybackId ||
                                !video.thumbnailKey
                              }
                              onClick={() =>
                                restoreThumbnailMutation.mutate({
                                  videoId,
                                })
                              }
                            >
                              <RotateCcwIcon
                                className={cn(
                                  "size-4 mr-1 group-hover:motion-rotate-in-[0.5turn]",
                                  restoreThumbnailMutation.isPending &&
                                    "motion-preset-spin motion-duration-1500"
                                )}
                              />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="relative">
                        <div className=" overflow-x-hidden overflow-y-auto">
                          {renderCategoryList()}
                        </div>
                      </SelectContent>
                      <FormMessage />
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-8 col-span-1 lg:col-span-2">
              <div className="space-y-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
                <AspectRatio
                  ratio={16 / 9}
                  className="overflow-hidden relative"
                >
                  <VideoPlayer
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                </AspectRatio>

                <div className="p-4 space-y-6">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">
                        {video.title}
                      </p>

                      <div className="flex items-center gap-x-2">
                        <Link href={`/videos/${videoId}`}>
                          <p className="text-xs sm:text-sm line-clamp-1 text-blue-500">
                            {url}
                          </p>
                        </Link>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => copyToClipboard(url)}
                          disabled={isCopied}
                        >
                          {isCopied ? (
                            <CheckIcon className="size-4" />
                          ) : (
                            <CopyIcon className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Video status
                      </p>
                      {video.muxStatus ? (
                        <VideoStatusBadge
                          status={snakeCaseToTitleCase(video.muxStatus)}
                        />
                      ) : (
                        "_ _"
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Subtitle status
                      </p>
                      {video.muxTrackStatus ? (
                        <VideoStatusBadge
                          status={snakeCaseToTitleCase(video.muxTrackStatus)}
                        />
                      ) : (
                        "_ _"
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Visibility</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center">
                            <Globe2Icon className="size-4 mr-2" />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center">
                            <LockIcon className="size-4 mr-2" />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export const VideoSection: React.FC<VideoSectionProps> = ({ videoId }) => {
  return (
    <Suspense fallback={<VideoSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};
