import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Função utilitária interna para recálculo
async function runRecalculate(ctx: any, group: string, userId: string) {
  const teams = await ctx.db.query("teams")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("group"), group)).collect();
  const matches = await ctx.db.query("matches")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.and(q.eq(q.field("group"), group), q.eq(q.field("phase"), "Group"))).collect();

  const stats: Record<string, any> = {};
  teams.forEach((t: any) => {
    const idStr = t._id.toString();
    stats[idStr] = { 
        id: t._id, 
        played: 0, 
        wins: 0, 
        draws: 0, 
        losses: 0, 
        points: 0, 
        goalsScored: 0, 
        goalsAgainst: 0, 
        goalDifference: 0 
    };
  });

  matches.forEach((m: any) => {
    if (m.status !== "encerrado") return;
    const h = stats[m.homeTeamId.toString()];
    const a = stats[m.awayTeamId.toString()];
    
    if (!h || !a) return;

    h.played++; a.played++;
    h.goalsScored += m.homeGoals; h.goalsAgainst += m.awayGoals;
    a.goalsScored += m.awayGoals; a.goalsAgainst += m.homeGoals;
    
    if (m.homeGoals > m.awayGoals) {
        h.points += 3; h.wins++; a.losses++;
    } else if (m.homeGoals < m.awayGoals) {
        a.points += 3; a.wins++; h.losses++;
    } else {
        h.points += 1; a.points += 1; h.draws++; a.draws++;
    }
  });

  const sorted = Object.values(stats).sort((a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsScored - a.goalsAgainst;
    const gdB = b.goalsScored - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsScored - a.goalsScored;
  });

  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    await ctx.db.patch(s.id, { 
        played: s.played,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        points: s.points, 
        goalsScored: s.goalsScored, 
        goalsAgainst: s.goalsAgainst, 
        goalDifference: s.goalsScored - s.goalsAgainst, 
        rank: i + 1 
    });
  }
}

export const fixAllStandings = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || "default_user";

    const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    for (const g of GROUPS) {
      await runRecalculate(ctx, g, userId);
    }
  }
});
