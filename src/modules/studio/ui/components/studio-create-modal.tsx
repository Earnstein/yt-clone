"use client";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
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
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { StudioUploadVideoModal } from "./studio-upload-video";
const createVideoSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(32),
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(128),
  categoryId: z.string().min(1, { message: "Category is required" }),
  visibility: z.enum(["public", "private"]),
});

type TCreateVideo = z.infer<typeof createVideoSchema>;

const CategoryListSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="w-full h-8 rounded-none" />
    ))}
  </div>
);

const StudioCreateModalSuspense = () => {
  const pathname = usePathname();
  const { videoId } = useParams<{ videoId: string }>();
  const [open, setOpen] = useState(false);
  const [categories] = trpc.categories.getAll.useSuspenseQuery();

  const form = useForm<TCreateVideo>({
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      visibility: "private",
    },
    resolver: zodResolver(createVideoSchema),
  });
  const utils = trpc.useUtils();
  const mutation = trpc.videos.createVideo.useMutation({
    onSuccess: () => {
      toast.success("Video created successfully");
      form.reset();
      utils.studio.getAllVideos.invalidate();
      utils.home.getTrendingVideos.invalidate();
      utils.home.getHomeVideos.invalidate();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (data: TCreateVideo) => {
    mutation.mutate(data);
  };

  return (
    <>
      <ResponsiveModal
        open={open}
        title="Create Video"
        description="Create a new video"
        onOpenChange={setOpen}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
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
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <span className="text-body-2">{category.name}</span>
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                    <FormMessage />
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={mutation.isPending}
              isLoading={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? "Creating..." : "Create"}
            </Button>
          </form>
        </Form>
      </ResponsiveModal>

      {pathname === "/studio" ? (
        <Button
          variant="secondary"
          onClick={() => setOpen(true)}
          disabled={mutation.isPending}
          isLoading={mutation.isPending}
        >
          {!mutation.isPending && <PlusIcon className="size-4" />}
          {mutation.isPending ? "Creating..." : "Create"}
        </Button>
      ) : (
        <>
          <StudioUploadVideoModal videoId={videoId} />
        </>
      )}
    </>
  );
};

export const StudioCreateModal = () => {
  return (
    <ErrorBoundary fallback={<div>Error</div>}>
      <Suspense fallback={<CategoryListSkeleton />}>
        <StudioCreateModalSuspense />
      </Suspense>
    </ErrorBoundary>
  );
};
