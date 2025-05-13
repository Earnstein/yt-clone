import { commentInsertSchema } from "@/db/schema";
import { z } from "zod";

export const commentFormSchema = commentInsertSchema
  .omit({
    userId: true,
    id: true,
  })
  .extend({
    comment: z.string().trim().min(1, { message: "Comment is required" }),
  });
