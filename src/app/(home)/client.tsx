"use client";
import { trpc } from "@/trpc/client";
export default function HomeClient() {
  const [data] = trpc.hello.useSuspenseQuery({ text: "Bakare Damilola" });
  return <div>{data.greeting}</div>;
}
