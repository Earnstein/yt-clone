import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export const StudioUploadModal = () => {
  return (
    <Button variant="secondary">
      <PlusIcon className="size-4" />
      Create
    </Button>
  );
};
