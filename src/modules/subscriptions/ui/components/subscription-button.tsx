import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
interface SubscriptionButtonProps {
  onClick: ButtonProps["onClick"];
  disabled?: boolean;
  isSubscribed: boolean;
  className?: string;
  size?: ButtonProps["size"];
}

export const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({
  isSubscribed,
  disabled = false,
  onClick,
  className,
  size,
}) => {
  return (
    <Button
      variant={isSubscribed ? "secondary" : "default"}
      className={cn("rounded-full", className)}
      size={size}
      disabled={disabled}
      onClick={onClick}
    >
      {isSubscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
};
