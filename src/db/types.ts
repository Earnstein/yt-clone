import {
  videoInsertSchema,
  videoSelectSchema,
  videoUpdateSchema,
} from "@/db/schema";
import { z } from "zod";

export type TCreateVideo = z.infer<typeof videoInsertSchema>;
export type TSelectVideo = z.infer<typeof videoSelectSchema>;
export type TUpdateVideo = z.infer<typeof videoUpdateSchema>;
