import { db } from "@/db";
import { users } from "@/db/schema";
import { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { Webhook } from "svix";
export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Do something with payload
  // For this guide, log payload to console
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { email_addresses, first_name, last_name, image_url, id } = evt.data;
    await db.insert(users).values({
      id: id,
      firstName: first_name,
      lastName: last_name,
      email: email_addresses[0].email_address,
      imageUrl: image_url,
    });
  }

  if (eventType === "user.updated") {
    const { email_addresses, first_name, last_name, image_url, id } = evt.data;
    await db
      .update(users)
      .set({
        firstName: first_name,
        lastName: last_name,
        email: email_addresses[0].email_address,
        imageUrl: image_url,
      })
      .where(eq(users.id, id));
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (!id) {
      return new Response("Error: User ID is required", {
        status: 400,
      });
    }
    await db.delete(users).where(eq(users.id, id));
  }

  return new Response("Webhook received", { status: 200 });
}
