import { query } from "./_generated/server";

export const debugMatches = query({
  args: {},
  handler: async (ctx) => {
    const matches = await ctx.db.query("matches").take(5);
    return matches.map(m => ({ id: m._id, userId: m.userId }));
  }
});
