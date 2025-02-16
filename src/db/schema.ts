import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// TODO: TO remove clerkId and save it under id
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  // TODO: add banner field
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const categories = pgTable(
  "categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("name_idx").on(t.name)]
);

export const videos = pgTable("videos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: text("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),

  muxStatus: text("mux_status"),
  muxUploadId: text("mux_upload_id").unique(),
  muxAssetId: text("mux_asset_id").unique(),
  muxPlaybackId: text("mux_playback_id").unique(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackStatus: text("mux_track_status").unique(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/*
Note: This is for application-level use only and doesn't affect database-level relations.
It's useful for query like builders as in Prisma (e.g., video.findMany({ include: { user: true } }))
or for databases that do not support relations like SQLs e.g planetscale.
It is not necessary for Drizzle's select and join operations. It's included here for learning purposes.

refer to https://orm.drizzle.team/docs/relations for more information
*/
export const videoRelations = relations(videos, ({ one }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
}));

export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  videos: many(videos),
}));
