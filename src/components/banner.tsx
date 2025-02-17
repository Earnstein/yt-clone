"use client";

import { Button } from "@/components/ui/button";
import { BellIcon, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BannerProps {
  title: string;
}
export const Banner = ({ title }: BannerProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem("bannerLastShown");
    const now = new Date().getTime();
    const fourDaysInMs = 4 * 24 * 60 * 60 * 1000;

    if (!lastShown || now - parseInt(lastShown) > fourDaysInMs) {
      setIsVisible(true);
      localStorage.setItem("bannerLastShown", now.toString());
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-muted px-4 py-3 text-foreground motion-opacity-in-0 motion-translate-y-in-100 motion-blur-in-md bg-blue-100 shadow-md">
      <div className="flex gap-2">
        <div className="flex grow gap-3">
          <BellIcon
            className="mt-0.5 shrink-0 opacity-60 text-blue-600 motion-preset-seesaw"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
          <div className="flex grow flex-col justify-between gap-2 md:flex-row">
            <p className="text-xs">{title}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
          onClick={() => setIsVisible(false)}
          aria-label="Close banner"
        >
          <X
            size={16}
            strokeWidth={2}
            className="opacity-60 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  );
};
