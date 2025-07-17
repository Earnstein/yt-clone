"use client";
import { ResponsiveModal } from "@/components/responsive-modal";
import { AspectRatio } from "@/components/ui/aspect-ratio";
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
import { playlistUpdateSchema } from "@/db/schema";
import { TUpdatePlaylist } from "@/db/types";
import { THUMBNAIL_PLACEHOLDER_URL } from "@/lib/constants";
import { TPlaylists } from "@/modules/playlist/types";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface EditPlaylistModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  playlist: TPlaylists[number];
}

export const EditPlaylistModal: React.FC<EditPlaylistModalProps> = ({
  open,
  setOpen,
  playlist,
}) => {
  const form = useForm<TUpdatePlaylist>({
    defaultValues: {
      name: playlist.name,
      description: playlist.description,
      visibility: playlist.visibility,
    },
    resolver: zodResolver(playlistUpdateSchema),
  });
  const utils = trpc.useUtils();

  const mutation = trpc.playlist.updatePlaylist.useMutation({
    onSuccess: ({ playlist: updatedPlaylist }) => {
      toast.success(`${updatedPlaylist.name} playlist updated successfully`);
      form.reset({
        name: updatedPlaylist.name,
        description: updatedPlaylist.description,
        visibility: updatedPlaylist.visibility,
      });
      setOpen(false);
      utils.playlist.getPlaylists.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (data: TUpdatePlaylist) => {
    return mutation.mutate({
      playlistId: playlist.id,
      name: data.name,
      description: data.description || undefined,
      visibility: data.visibility,
    });
  };

  return (
    <ResponsiveModal
      open={open}
      title="Edit Playlist"
      description="Edit your playlist"
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
          setOpen(false);
        }
      }}
    >
      <div className="space-y-4">
        <AspectRatio
          ratio={16 / 9}
          className="relative overflow-hidden rounded-xl"
        >
          <Image
            src={playlist.thumbNailUrl || THUMBNAIL_PLACEHOLDER_URL}
            alt={playlist.name}
            fill
            className="object-cover size-full"
          />
        </AspectRatio>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
                    <Textarea
                      {...field}
                      value={field.value || undefined}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
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
              {mutation.isPending ? "Updating..." : "Update"}
            </Button>
          </form>
        </Form>
      </div>
    </ResponsiveModal>
  );
};
