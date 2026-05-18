import { query } from "./_generated/server";

export const debugMatches = query({
  args: {},
  handler: async (ctx) => {
    const matches = await ctx.db.query("matches").collect();
    const counts: Record<string, number> = {};
    for (const m of matches) {
      const key = m.userId === undefined ? "undefined" : m.userId;
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }
});
