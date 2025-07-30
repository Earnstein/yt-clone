import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorComponentProps {
  onRetry?: () => void;
  variant?: "sm" | "lg";
  title?: string;
  description?: string;
}

export const ErrorComponent: React.FC<ErrorComponentProps> = ({
  onRetry,
  title = "Unable to load",
  description = "There was a problem loading. Try refreshing the page or check your connection.",
}) => {
  return (
    <div className="w-full py-4">
      <Alert className="max-w-md mx-auto border-destructive/50 bg-destructive/5">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-sm text-foreground">
          <div className="space-y-2">
            <p className="font-medium">{title}</p>
            <p className="text-muted-foreground text-xs">{description}</p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-2 h-7 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try again
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
