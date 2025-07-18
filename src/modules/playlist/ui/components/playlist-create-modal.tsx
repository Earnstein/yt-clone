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
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createPlaylistSchema = z.object({
  name: z.string().min(1, { message: "Title is required" }).max(32),
  description: z.string().max(128).optional(),
  visibility: z.enum(["public", "private"]).default("private"),
});

type TCreatePlaylist = z.infer<typeof createPlaylistSchema>;

interface PlaylistCreateModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const PlaylistCreateModal: React.FC<PlaylistCreateModalProps> = ({
  open,
  setOpen,
}) => {
  const form = useForm<TCreatePlaylist>({
    defaultValues: {
      name: "",
      description: "",
      visibility: "private",
    },
    resolver: zodResolver(createPlaylistSchema),
  });
  const utils = trpc.useUtils();
  //TODO: to implement optimistic UI for playlist creation

  const mutation = trpc.playlist.createPlaylist.useMutation({
    onSuccess: (_, variables) => {
      toast.success(`${variables.name} playlist created successfully`);
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      utils.playlist.getPlaylists.invalidate();
    },
  });

  const handleSubmit = (data: TCreatePlaylist) => {
    return mutation.mutate(data);
  };

  return (
    <ResponsiveModal
      open={open}
      title="Create Playlist"
      description="Create a new playlist"
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
          setOpen(false);
        }
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
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
  );
};
