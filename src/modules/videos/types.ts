import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type TGetOneVideoOutput =
  inferRouterOutputs<AppRouter>["videos"]["getOne"];

export type TGetManyVideosOutput =
  inferRouterOutputs<AppRouter>["suggestions"]["getSuggestions"]; //TODO: To change to videos getmany
