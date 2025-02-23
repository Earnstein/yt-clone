import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

//TODO: implement videoreaction
export const VideoReactions = () => {
  const viewReactions: "like" | "dislike" = "like";
  return (
    <div className="flex flex-none items-center">
      <Button
        className="gap-2 pr-4 rounded-r-none rounded-l-full"
        variant="secondary"
      >
        <ThumbsUpIcon
          className={cn("size-5", viewReactions === "like" && "fill-black")}
        />
        1
      </Button>
      <Separator orientation="vertical" className="h-7" />

      <Button
        className="pl-4 rounded-r-full rounded-l-none"
        variant="secondary"
      >
        <ThumbsDownIcon
          className={cn("size-5", viewReactions !== "like" && "fill-black")}
        />
        1
      </Button>
    </div>
  );
};
