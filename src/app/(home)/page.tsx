import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import HomeClient from "./client";
export default async function Home() {
  void trpc.hello.prefetch({ text: "Bakare Damilola" });
  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Error</div>}>
          <HomeClient />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
