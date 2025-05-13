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
import { TCreateComment } from "@/db/types";
import { AVATAR_PLACEHOLDER_URL } from "@/lib/constants";
import { trpc } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { commentFormSchema } from "../../schema/validation";

interface CommentFormProps {
  videoId: string;
  onSuccess?: () => void;
  avatarSize?: "sm" | "lg";
  variant?: "comment" | "reply";
  parentId?: string;
  onCancel?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  videoId,
  onSuccess,
  avatarSize = "lg",
  variant = "comment",
  parentId,
  onCancel,
}) => {
  const { user } = useUser();
  const utils = trpc.useUtils();
  const createMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      if (error.data?.code === "BAD_REQUEST") {
        return toast.error("Invalid comment");
      }
      return toast.error("Something went wrong");
    },
  });
  const form = useForm<TCreateComment>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      comment: "",
      videoId,
      parentId,
    },
  });

  const handleSubmit = (data: TCreateComment) => {
    return createMutation.mutate(data);
  };

  const isDisabled = createMutation.isPending || !form.formState.isValid;
  return (
    <Form {...form}>
      <form
        className="flex gap-4 group"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <UserAvatar
          imageUrl={user?.imageUrl || AVATAR_PLACEHOLDER_URL}
          name={user?.fullName || "user"}
          size={avatarSize}
        />
        <div className="flex-1 space-y-2">
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder={
                      variant === "comment"
                        ? "Add a comment"
                        : "Reply to this comment..."
                    }
                    className="resize-none bg-transparent overflow-hidden min-h-0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  form.reset();
                  onCancel();
                }}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isDisabled}>
              {variant === "comment" ? "Comment" : "Reply"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
