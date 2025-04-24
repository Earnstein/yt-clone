import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { commentInsertSchema } from "@/db/schema";
import { TCreateComment } from "@/db/types";
import { AVATAR_PLACEHOLDER_URL } from "@/lib/constants";
import { trpc } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface CommentFormProps {
  videoId: string;
  onSuccess?: () => void;
}
const commentFormSchema = commentInsertSchema.omit({
  userId: true,
});
export const CommentForm: React.FC<CommentFormProps> = ({
  videoId,
  onSuccess,
}) => {
  const { user } = useUser();
  const utils = trpc.useUtils();
  const createMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId });
      form.reset();
      onSuccess?.();
    },
  });
  const form = useForm<TCreateComment>({
    resolver: zodResolver(commentFormSchema),
    mode: "onTouched",
    defaultValues: {
      comment: "",
      videoId,
    },
  });

  const handleSubmit = (data: TCreateComment) => {
    console.log(data);
    createMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        className="flex gap-4 group"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <UserAvatar
          imageUrl={user?.imageUrl || AVATAR_PLACEHOLDER_URL}
          name={user?.fullName || "user"}
          size="lg"
        />
        <div className="flex-1 space-y-2">
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Add a comment"
                    className="resize-none bg-transparent overflow-hidden min-h-0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2 justify-end">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Commenting..." : "Comment"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
