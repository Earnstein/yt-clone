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
import { useState } from "react";
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

export const StudioCreateModal = () => {
  const pathname = usePathname();
  const { videoId } = useParams<{ videoId: string }>();
  const [open, setOpen] = useState(false);

  const form = useForm<TCreateVideo>({
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      visibility: "public",
    },
    resolver: zodResolver(createVideoSchema),
  });
  const utils = trpc.useUtils();
  const mutation = trpc.videos.createVideo.useMutation({
    onSuccess: () => {
      toast.success("Video created successfully");
      form.reset();
      utils.studio.getAllVideos.invalidate();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const categories = trpc.categories.getAll.useQuery();

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
                        {renderCategoryList()}
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
