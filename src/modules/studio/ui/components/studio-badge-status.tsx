import { Badge } from "@/components/ui/badge";

enum StudioStatus {
  PREPARING = "Preparing",
  READY = "Ready",
  FAILED = "Failed",
}

interface StatusBadgeProps {
  status: string;
}
export default function PaymentStatusBadge({ status }: StatusBadgeProps) {
  return (
    <>
      {status === StudioStatus.PREPARING ? (
        <Badge variant="outline" className="capitalize rounded-full">
          {status}
        </Badge>
      ) : status === StudioStatus.FAILED ? (
        <Badge variant="destructive" className="capitalize rounded-full">
          {status}
        </Badge>
      ) : status === StudioStatus.READY ? (
        <Badge variant="secondary" className="capitalize rounded-full">
          {status}
        </Badge>
      ) : (
        <></>
      )}
    </>
  );
}
