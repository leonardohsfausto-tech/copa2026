import { internalMutation, internalQuery, mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveSubscription = mutation({
  args: {
    userId: v.optional(v.string()),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("push_subscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) {
      if (existing.userId !== args.userId) {
        await ctx.db.patch(existing._id, { userId: args.userId });
      }
      return existing._id;
    }

    return await ctx.db.insert("push_subscriptions", {
      userId: args.userId,
      endpoint: args.endpoint,
      keys: args.keys,
    });
  },
});

export const removeSubscription = mutation({
  args: {
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("push_subscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// Query interna para buscar todas as inscrições
export const getAllSubscriptions = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("push_subscriptions").collect();
  },
});

// Mutation interna para remover inscrições inválidas
export const internalRemoveSubscription = internalMutation({
  args: {
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("push_subscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
