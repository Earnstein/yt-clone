import {
  commentInsertSchema,
  commentSelectSchema,
  commentUpdateSchema,
  videoInsertSchema,
  videoSelectSchema,
  videoUpdateSchema,
} from "@/db/schema";
import { z } from "zod";

export type TCreateVideo = z.infer<typeof videoInsertSchema>;
export type TSelectVideo = z.infer<typeof videoSelectSchema>;
export type TUpdateVideo = z.infer<typeof videoUpdateSchema>;

export type TCreateComment = z.infer<typeof commentInsertSchema>;
export type TSelectComment = z.infer<typeof commentSelectSchema>;
export type TUpdateComment = z.infer<typeof commentUpdateSchema>;
