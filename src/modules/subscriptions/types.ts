import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type TGetSubscribersOutput =
  inferRouterOutputs<AppRouter>["subscriptions"]["getSubscribers"]["items"];
