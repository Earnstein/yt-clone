import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type TPlaylists =
  inferRouterOutputs<AppRouter>["playlist"]["getPlaylists"]["items"];

export type TGetOnePlaylistOutput =
  inferRouterOutputs<AppRouter>["playlist"]["getPlaylistVideos"]["items"];
