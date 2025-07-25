import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const GET = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  redirect(`/users/${userId}`);
};
