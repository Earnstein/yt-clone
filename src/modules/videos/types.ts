import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type TGetOneVideoOutput =
  inferRouterOutputs<AppRouter>["videos"]["getOne"];
