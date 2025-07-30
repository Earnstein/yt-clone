import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorComponentProps {
  onRetry?: () => void;
  variant?: "sm" | "lg";
}

export const ErrorComponent: React.FC<ErrorComponentProps> = ({ onRetry }) => {
  return (
    <div className="w-full py-4">
      <Alert className="max-w-md mx-auto border-destructive/50 bg-destructive/5">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-sm text-foreground">
          <div className="space-y-2">
            <p className="font-medium">Unable to load categories</p>
            <p className="text-muted-foreground text-xs">
              There was a problem loading the category filters. Try refreshing
              the page or check your connection.
            </p>
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
