import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("revelations")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const create = mutation({
  args: {
    verse: v.string(),
    reference: v.string(),
    reflection: v.string(),
    audioBase64: v.optional(v.string()),
    videoStorageId: v.optional(v.id("_storage")),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("revelations", {
      userId,
      verse: args.verse,
      reference: args.reference,
      reflection: args.reflection,
      audioBase64: args.audioBase64,
      videoStorageId: args.videoStorageId,
      videoUrl: args.videoUrl,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("revelations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const revelation = await ctx.db.get(args.id);
    if (!revelation || revelation.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
