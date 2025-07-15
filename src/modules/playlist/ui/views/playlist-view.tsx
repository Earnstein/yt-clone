"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { PlaylistCreateModal } from "../components/playlist-create-modal";
import { PlaylistSection } from "../sections/playlist-section";

export const PlaylistView = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-bold">Playlist</h1>
            <p className="text-sm text-muted-foreground">
              Your playlist collections
            </p>
          </div>

          <Button
            className="rounded-full"
            variant="outline"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>

        <PlaylistSection />
      </div>
      <PlaylistCreateModal open={open} setOpen={setOpen} />
    </>
  );
};
