import { Badge } from "@/components/ui/badge";

enum VideoStatus {
  PREPARING = "Preparing",
  READY = "Ready",
  FAILED = "Failed",
}

interface StatusBadgeProps {
  status: string;
}
export default function VideoStatusBadge({ status }: StatusBadgeProps) {
  return (
    <>
      {status === VideoStatus.PREPARING ? (
        <Badge
          variant="outline"
          className="capitalize gap-1.5 rounded-full border-yellow-500"
        >
          <span
            className="size-1.5 rounded-full bg-amber-500"
            aria-hidden="true"
          ></span>
          {status}
        </Badge>
      ) : status === VideoStatus.FAILED ? (
        <Badge
          variant="outline"
          className="capitalize gap-1.5 rounded-full border-red-500"
        >
          <span
            className="size-1.5 rounded-full bg-red-500"
            aria-hidden="true"
          ></span>
          {status}
        </Badge>
      ) : status === VideoStatus.READY ? (
        <Badge
          variant="outline"
          className="capitalize gap-1.5 rounded-full border-green-500"
        >
          <span
            className="size-1.5 rounded-full bg-green-500"
            aria-hidden="true"
          ></span>
          {status}
        </Badge>
      ) : (
        <></>
      )}
    </>
  );
}
