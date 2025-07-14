import { categoriesRouter } from "@/modules/categrories/server/procedure";
import { commentReactionsRouter } from "@/modules/comment-reactions/server/procedure";
import { commentsRouter } from "@/modules/comments/server/procedures";
import { homeRouter } from "@/modules/home/server/procedure";
import { playlistRouter } from "@/modules/playlist/server/procedure";
import { searchRouter } from "@/modules/search/server/procedure";
import { studioRouter } from "@/modules/studio/server/procedures";
import { subscriptionsRouter } from "@/modules/subscriptions/server/procedure";
import { suggestionsRouter } from "@/modules/suggestions/server/procedure";
import { videoReactionsRouter } from "@/modules/video-reactions/server/procedure";
import { videoViewsRouter } from "@/modules/video-views/server/procedure";
import { videosRouter } from "@/modules/videos/server/procedures";
import { createTRPCRouter } from "../init";
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter,
  videoViews: videoViewsRouter,
  videoReactions: videoReactionsRouter,
  subscriptions: subscriptionsRouter,
  comments: commentsRouter,
  commentReactions: commentReactionsRouter,
  suggestions: suggestionsRouter,
  search: searchRouter,
  home: homeRouter,
  playlist: playlistRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
