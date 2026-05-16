import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const initialize = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autorizado: Faça login para inicializar sua simulação.");
    }
    const userId = identity.subject;

    console.log(`Inicializando simulação para o usuário: ${userId}...`);

    // 1. Remove dados antigos do usuário
    const existingTeams = await ctx.db.query("teams")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const existingMatches = await ctx.db.query("matches")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    // Opcional: também remover standings e favorites se for um hard reset
    const existingFavorites = await ctx.db.query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const t of existingTeams) await ctx.db.delete(t._id);
    for (const m of existingMatches) await ctx.db.delete(m._id);
    for (const f of existingFavorites) await ctx.db.delete(f._id);

    // 2. Busca o template global (userId = "global")
    const globalTeams = await ctx.db.query("teams")
      .withIndex("by_user", (q) => q.eq("userId", "global"))
      .collect();
    const globalMatches = await ctx.db.query("matches")
      .withIndex("by_user", (q) => q.eq("userId", "global"))
      .collect();

    if (globalTeams.length === 0 || globalMatches.length === 0) {
      throw new Error("Template global não encontrado. Por favor, rode a inicialização global primeiro.");
    }

    // 3. Clona os times e guarda o mapeamento de IDs
    const teamIdMap = new Map<string, string>();
    for (const t of globalTeams) {
      const { _id, _creationTime, ...data } = t;
      const newId = await ctx.db.insert("teams", { ...data, userId });
      teamIdMap.set(_id, newId);
    }

    // 4. Clona as partidas, atualizando os IDs dos times
    for (const m of globalMatches) {
      const { _id, _creationTime, homeTeamId, awayTeamId, winnerId, ...data } = m;
      
      const newMatch: any = { ...data, userId };
      
      if (homeTeamId && teamIdMap.has(homeTeamId)) {
        newMatch.homeTeamId = teamIdMap.get(homeTeamId);
      }
      if (awayTeamId && teamIdMap.has(awayTeamId)) {
        newMatch.awayTeamId = teamIdMap.get(awayTeamId);
      }
      if (winnerId && teamIdMap.has(winnerId)) {
        newMatch.winnerId = teamIdMap.get(winnerId);
      }
      
      await ctx.db.insert("matches", newMatch);
    }

    console.log(`Simulação inicializada com sucesso para ${userId}.`);
  }
});
