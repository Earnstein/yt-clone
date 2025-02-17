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
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
const createVideoSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(32),
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(128),
  categoryId: z.string().min(1, { message: "Category is required" }),
});

type TCreateVideo = z.infer<typeof createVideoSchema>;

export const StudioCreateModal = () => {
  const [open, setOpen] = useState(false);

  const form = useForm<TCreateVideo>({
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
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

  const [categories] = trpc.categories.getAll.useSuspenseQuery();

  const renderCategoryList = () => {
    if (categories.length === 0) {
      return (
        <div className="space-y-1 border-b border-neutral-200">
          <SelectItem value="none" disabled>
            No categories available
          </SelectItem>
        </div>
      );
    }

    return categories.map((category) => (
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
                    <Input {...field} />
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

      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        disabled={mutation.isPending}
        isLoading={mutation.isPending}
      >
        {!mutation.isPending && <PlusIcon className="size-4" />}
        {mutation.isPending ? "Creating..." : "Create"}
      </Button>
    </>
  );
};
