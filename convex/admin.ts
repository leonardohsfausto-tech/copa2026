import { query } from "./_generated/server";

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const matches = await ctx.db.query("matches").collect();
    const userMatches = matches.filter(m => m.userId !== undefined && m.userId !== null);
    const uniqueUsersWithMatches = new Set(userMatches.map(m => m.userId).filter(id => id !== undefined));

    return {
      activeSimulations: uniqueUsersWithMatches.size,
      totalMatchesSimulated: userMatches.length,
    };
  },
});

export const getAdminUsersDetails = query({
  args: {},
  handler: async (ctx) => {
    const matches = await ctx.db.query("matches").collect();
    const userMatches = matches.filter(m => m.userId !== undefined && m.userId !== null);
    
    const matchesByUser: Record<string, number> = {};
    for (const match of userMatches) {
      if (match.userId) {
        matchesByUser[match.userId] = (matchesByUser[match.userId] || 0) + 1;
      }
    }

    const allSubs = await ctx.db.query("push_subscriptions").collect();
    const subsByUser: Record<string, boolean> = {};
    for (const sub of allSubs) {
      if (sub.userId) {
        subsByUser[sub.userId] = true;
      }
    }

    return {
      matchesByUser,
      subsByUser,
    };
  },
});

