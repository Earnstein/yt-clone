import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type TGetOneUserOutput =
  inferRouterOutputs<AppRouter>["users"]["getOne"];
