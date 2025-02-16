import { mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
export const videosRouter = createTRPCRouter({
  createVideo: protectedProcedure.mutation(async ({ ctx }) => {
    // TODO: to turn this into a upload procedure
    const { id: userId } = ctx.user;

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policy: ["public"],
      },
      cors_origin: "*", // TODO: in production, restrict this to the frontend domain
    });

    return {
      url: upload.url,
    };
  }),
});
