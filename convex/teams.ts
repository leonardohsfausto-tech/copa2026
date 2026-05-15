import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || "default_user";

    const teams = await ctx.db
      .query("teams")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const favoriteTeamIds = new Set(favorites.map((f: any) => f.teamId));
    
    return teams.map((t: any) => ({
      ...t,
      isFavorite: favoriteTeamIds.has(t._id)
    }));
  },
});

export const getByGroup = query({
  args: { group: v.string() },
  handler: async (ctx: any, args: { group: string }) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || "default_user";

    const teams = await ctx.db
      .query("teams")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.eq(q.field("group"), args.group))
      .collect();
    
    return teams.sort((a: any, b: any) => (a.rank || 0) - (b.rank || 0));
  },
});

export const toggleFavorite = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx: any, args: { teamId: any }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autorizado");
    const userId = identity.subject;

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.eq(q.field("teamId"), args.teamId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("favorites", {
        userId,
        teamId: args.teamId
      });
    }
  },
});

export const getBestThirds = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || "default_user";
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    
    // Agrupa por grupo e pega o 3º colocado de cada
    const groups: Record<string, any[]> = {};
    teams.forEach((t: any) => {
      if (!groups[t.group]) groups[t.group] = [];
      groups[t.group].push(t);
    });

    const thirds: any[] = [];
    Object.values(groups).forEach(groupTeams => {
      const third = groupTeams.find((t: any) => t.rank === 3);
      if (third) thirds.push(third);
    });

    // Ordena conforme regras: Pontos > SG > GP
    return thirds.sort((a, b) => 
      b.points - a.points || b.goalDifference - a.goalDifference || b.goalsScored - a.goalsScored
    );
  },
});
