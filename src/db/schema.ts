import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

// Users schema
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  // TODO: add banner field
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Categories schema
export const categories = pgTable("categories", {
  id: varchar("id", { length: 16 }).primaryKey(),
  name: varchar("name", { length: 32 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Video visibility
export const visibility = pgEnum("visibility", ["public", "private"]);

// Videos schema
export const videos = pgTable("videos", {
  id: varchar("id", { length: 16 }).primaryKey(),
  title: varchar("title", { length: 128 }).notNull(),
  description: varchar("description", { length: 255 }),
  userId: text("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  categoryId: varchar("category_id", { length: 16 }).references(
    () => categories.id,
    {
      onDelete: "set null",
    }
  ),

  muxStatus: text("mux_status"),
  muxUploadId: text("mux_upload_id").unique(),
  muxAssetId: text("mux_asset_id").unique(),
  muxPlaybackId: text("mux_playback_id").unique(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackStatus: text("mux_track_status"),
  visibility: visibility("visibility").notNull().default("private"),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key"),
  previewUrl: text("preview_url"),
  previewKey: text("preview_key"),
  duration: integer("duration").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Video views schema
export const videoViews = pgTable(
  "video_views",
  {
    userId: text("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    videoId: varchar("video_id", { length: 16 })
      .references(() => videos.id, {
        onDelete: "cascade",
      })
      .notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      name: "video_views_pk",
      columns: [t.userId, t.videoId],
    }),
  ]
);

// Video comments schema
export const comments = pgTable(
  "comments",
  {
    id: varchar("id", { length: 16 }).primaryKey(),
    parentId: varchar("parent_id", { length: 16 }),
    videoId: varchar("video_id", { length: 16 })
      .references(() => videos.id, {
        onDelete: "cascade",
      })
      .notNull(),
    userId: text("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    comment: varchar("comment", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("comments_video_id_idx").on(t.videoId),
    foreignKey({
      columns: [t.parentId],
      foreignColumns: [t.id],
      name: "comments_parent_id_fk",
    }).onDelete("cascade"),
  ]
);

export const reactionTypes = pgEnum("reaction_types", ["like", "dislike"]);

// Comment reactions schema
export const commentReactions = pgTable(
  "comment_reactions",
  {
    userId: text("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    commentId: varchar("comment_id", { length: 16 })
      .references(() => comments.id, {
        onDelete: "cascade",
      })
      .notNull(),
    type: reactionTypes("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      name: "comment_reactions_pk",
      columns: [t.userId, t.commentId],
    }),
  ]
);
// Video reactions schema
export const videoReactions = pgTable(
  "video_reactions",
  {
    userId: text("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    videoId: varchar("video_id", { length: 16 })
      .references(() => videos.id, {
        onDelete: "cascade",
      })
      .notNull(),
    type: reactionTypes("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      name: "video_reactions_pk",
      columns: [t.userId, t.videoId],
    }),
  ]
);

// Subscriptions schema
export const subscriptions = pgTable(
  "subscriptions",
  {
    viewerId: text("viewer_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    creatorId: text("creator_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      name: "subscription_pk",
      columns: [t.viewerId, t.creatorId],
    }),
  ]
);

// Playlists schema
export const playlists = pgTable("playlists", {
  id: varchar("id", { length: 16 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: varchar("description", { length: 255 }),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  visibility: visibility("visibility").notNull().default("private"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Playlist items schema
export const playlistVideos = pgTable(
  "playlist_videos",
  {
    playlistId: varchar("playlist_id", { length: 16 })
      .references(() => playlists.id, { onDelete: "cascade" })
      .notNull(),
    videoId: varchar("video_id", { length: 16 })
      .references(() => videos.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      name: "playlist_videos_pk",
      columns: [t.playlistId, t.videoId],
    }),
  ]
);

/*
Note: This is for application-level use only and doesn't affect database-level relations.
It's useful for query like builders as in Prisma (e.g., video.findMany({ include: { user: true } }))
or for databases that do not support relations like SQLs e.g planetscale.
It is not necessary for Drizzle's select and join operations. It's included here for learning purposes.

refer to https://orm.drizzle.team/docs/relations for more information
*/

/* 
Example of how to read the relations

i.e A video can belong to a user and only one user.
A video can belong to one category and only one category.
A video can have many views.
A video can have many reactions.
A video can have many comments.

Example of how to use the relations
const video = await db.query.videos.findFirst({
  where: eq(videos.id, "1"),
  with: {
    user: true,
  },
});
*/
export const videoRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
    relationName: "videos_user_id_fk",
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
    relationName: "videos_category_id_fk",
  }),
  views: many(videoViews),
  reactions: many(videoReactions),
  comments: many(comments),
  playlistVideos: many(playlistVideos, {
    relationName: "playlist_videos_video_id_fk",
  }),
}));

export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  videoViews: many(videoViews),
  videoReactions: many(videoReactions),
  subscriptions: many(subscriptions, {
    relationName: "subscriptions_viewer_id_fk",
  }),
  subscribers: many(subscriptions, {
    relationName: "subscriptions_creator_id_fk",
  }),
  comments: many(comments),
  commentReactions: many(commentReactions),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  videos: many(videos),
}));

export const videoViewRelations = relations(videoViews, ({ one, many }) => ({
  user: one(users, {
    fields: [videoViews.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [videoViews.videoId],
    references: [videos.id],
  }),
  comments: many(comments),
}));

export const videoReactionRelations = relations(videoReactions, ({ one }) => ({
  user: one(users, {
    fields: [videoReactions.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [videoReactions.videoId],
    references: [videos.id],
  }),
}));

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  viewer: one(users, {
    fields: [subscriptions.viewerId],
    references: [users.id],
    relationName: "subscriptions_viewer_id_fk",
  }),
  creator: one(users, {
    fields: [subscriptions.creatorId],
    references: [users.id],
    relationName: "subscriptions_creator_id_fk",
  }),
}));

export const commentRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [comments.videoId],
    references: [videos.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comments_parent_id_fk",
  }),
  children: many(comments, {
    relationName: "comments_parent_id_fk",
  }),
  commentReactions: many(commentReactions),
}));

export const commentReactionRelations = relations(
  commentReactions,
  ({ one }) => ({
    user: one(users, {
      fields: [commentReactions.userId],
      references: [users.id],
    }),
    comment: one(comments, {
      fields: [commentReactions.commentId],
      references: [comments.id],
    }),
  })
);

export const playlistRelations = relations(playlists, ({ one, many }) => ({
  playlistVideos: many(playlistVideos, {
    relationName: "playlist_videos_playlist_id_fk",
  }),
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
    relationName: "playlists_user_id_fk",
  }),
}));

export const playlistVideoRelations = relations(playlistVideos, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistVideos.playlistId],
    references: [playlists.id],
    relationName: "playlist_videos_playlist_id_fk",
  }),
  video: one(videos, {
    fields: [playlistVideos.videoId],
    references: [videos.id],
    relationName: "playlist_videos_video_id_fk",
  }),
}));

// This helps generate zod schemas for the video table
export const videoInsertSchema = createInsertSchema(videos);
export const videoSelectSchema = createSelectSchema(videos);
export const videoUpdateSchema = createUpdateSchema(videos);

export const videoViewInsertSchema = createInsertSchema(videoViews);
export const videoViewSelectSchema = createSelectSchema(videoViews);
export const videoViewUpdateSchema = createUpdateSchema(videoViews);

export const videoReactionInsertSchema = createInsertSchema(videoReactions);
export const videoReactionSelectSchema = createSelectSchema(videoReactions);
export const videoReactionUpdateSchema = createUpdateSchema(videoReactions);

export const subscriptionInsertSchema = createInsertSchema(subscriptions);
export const subscriptionSelectSchema = createSelectSchema(subscriptions);
export const subscriptionUpdateSchema = createUpdateSchema(subscriptions);

export const commentInsertSchema = createInsertSchema(comments);
export const commentSelectSchema = createSelectSchema(comments);
export const commentUpdateSchema = createUpdateSchema(comments);

export const playlistInsertSchema = createInsertSchema(playlists);
export const playlistSelectSchema = createSelectSchema(playlists);
export const playlistUpdateSchema = createUpdateSchema(playlists);

export const playlistVideoInsertSchema = createInsertSchema(playlistVideos);
export const playlistVideoSelectSchema = createSelectSchema(playlistVideos);
export const playlistVideoUpdateSchema = createUpdateSchema(playlistVideos);
