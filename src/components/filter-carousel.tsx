import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

interface Props {
  value?: string | null;
  isLoading?: boolean;
  data: {
    value: string;
    label: string;
  }[];
  onSelect: (value: string | null) => void;
}

export const FilterCarousel: React.FC<Props> = ({
  value,
  isLoading = false,
  data,
  onSelect,
}) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [countState, setCountState] = useState({
    current: 0,
    count: 0,
  });

  useEffect(() => {
    if (!api) {
      return;
    }

    setCountState({
      count: api.scrollSnapList().length,
      current: api.selectedScrollSnap() + 1,
    });

    api.on("select", () => {
      setCountState((prev) => ({
        ...prev,
        current: api.selectedScrollSnap() + 1,
      }));
    });
  }, [api]);

  return (
    <div className="relative w-full">
      {/*Left Fade*/}

      <div
        className={cn(
          "absolute top-0 bottom-0 left-12 z-10 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none",
          countState.current === 1 && "hidden"
        )}
      />
      <Carousel
        opts={{
          align: "center",
          dragFree: true,
        }}
        setApi={setApi}
        className="px-12 w-full"
      >
        <CarouselContent className="-ml-3">
          {!isLoading && (
            <CarouselItem
              className="pl-3 basis-auto"
              onClick={() => onSelect(null)}
            >
              <Badge
                variant={!value ? "default" : "secondary"}
                className="px-3 py-1 text-xs whitespace-nowrap rounded-lg cursor-pointer sm:text-sm"
              >
                All
              </Badge>
            </CarouselItem>
          )}
          {isLoading &&
            Array.from({ length: 14 }).map((_, index) => (
              <CarouselItem key={index} className="pl-3 basis-auto">
                <Skeleton className="rounded-lg px-3 py-1 h-full text-sm w-[100px] font-semibold">
                  &nbsp;
                </Skeleton>
              </CarouselItem>
            ))}
          {!isLoading &&
            data.map((content) => (
              <CarouselItem
                key={content.label}
                className="pl-3 basis-auto"
                onClick={() => onSelect(content.value)}
              >
                <Badge
                  variant={value === content.value ? "default" : "secondary"}
                  className="px-3 py-1 text-xs whitespace-nowrap rounded-lg cursor-pointer sm:text-sm"
                >
                  {content.label}
                </Badge>
              </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 z-20" />
        <CarouselNext className="right-0 z-20" />
      </Carousel>

      {/*Right Fade*/}
      <div
        className={cn(
          "absolute top-0 bottom-0 right-12 z-10 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none",
          countState.current === countState.count && "hidden"
        )}
      />
    </div>
  );
};
