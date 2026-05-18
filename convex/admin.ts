import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { recalculateStandings, checkAndPopulateR32, propagateWinner } from "./matches";

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const matches = await ctx.db.query("matches").collect();
    // Excluir partidas da conta de semente global e sem userId
    const userMatches = matches.filter(m => m.userId !== undefined && m.userId !== null && m.userId !== "global");
    
    const uniqueUsersWithMatches = new Set(userMatches.map(m => m.userId).filter(id => id !== undefined));

    // Simulações completadas: usuários que finalizaram a partida da Final
    const completedUsers = new Set(
      userMatches
        .filter(m => m.phase === "Final" && m.status === "encerrado")
        .map(m => m.userId)
    );

    // Contagem de assinantes do Push Notification
    const allSubs = await ctx.db.query("push_subscriptions").collect();
    const uniqueSubsUsers = new Set(allSubs.map(s => s.userId).filter(Boolean));

    return {
      activeSimulations: uniqueUsersWithMatches.size,
      completedSimulations: completedUsers.size,
      totalMatchesSimulated: userMatches.length,
      totalPushSubscribers: uniqueSubsUsers.size,
    };
  },
});

export const getAdminUsersDetails = query({
  args: {},
  handler: async (ctx) => {
    const matches = await ctx.db.query("matches").collect();
    const userMatches = matches.filter(m => m.userId !== undefined && m.userId !== null && m.userId !== "global");
    
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

// Busca todas as partidas oficiais/globais para o painel administrativo
export const getGlobalMatches = query({
  args: {},
  handler: async (ctx) => {
    const matches = await ctx.db.query("matches")
      .withIndex("by_user", (q) => q.eq("userId", "global"))
      .collect();
    
    return await Promise.all(
      matches.map(async (match) => {
        const homeTeam = match.homeTeamId ? await ctx.db.get(match.homeTeamId) : null;
        const awayTeam = match.awayTeamId ? await ctx.db.get(match.awayTeamId) : null;
        return { ...match, homeTeam, awayTeam };
      })
    );
  }
});

// Altera o placar de uma partida global (Fallback manual)
export const updateGlobalMatchScore = mutation({
  args: {
    matchId: v.id("matches"),
    homeGoals: v.number(),
    awayGoals: v.number(),
    homeYellowCards: v.optional(v.number()),
    awayYellowCards: v.optional(v.number()),
    homeRedCards: v.optional(v.number()),
    awayRedCards: v.optional(v.number()),
    isExtraTime: v.optional(v.boolean()),
    isPenalties: v.optional(v.boolean()),
    status: v.string(), // "agendado", "ao vivo", "encerrado"
    winnerId: v.optional(v.id("teams")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autorizado: Faça login para gerenciar dados globais.");
    }
    
    // Restrição exclusiva para a conta Master do administrador
    if (identity.email !== "leonardohs.fausto@gmail.com") {
      throw new Error("Não autorizado: Somente o administrador master pode editar resultados oficiais.");
    }

    const match = await ctx.db.get(args.matchId);
    if (!match || match.userId !== "global") {
      throw new Error("Partida oficial não encontrada ou não é global.");
    }

    const updatedMatch = {
      ...match,
      homeGoals: args.homeGoals,
      awayGoals: args.awayGoals,
      homeYellowCards: args.homeYellowCards ?? 0,
      awayYellowCards: args.awayYellowCards ?? 0,
      homeRedCards: args.homeRedCards ?? 0,
      awayRedCards: args.awayRedCards ?? 0,
      isExtraTime: args.isExtraTime ?? false,
      isPenalties: args.isPenalties ?? false,
      status: args.status,
      winnerId: args.winnerId,
    };

    await ctx.db.patch(args.matchId, {
      homeGoals: args.homeGoals,
      awayGoals: args.awayGoals,
      homeYellowCards: args.homeYellowCards ?? 0,
      awayYellowCards: args.awayYellowCards ?? 0,
      homeRedCards: args.homeRedCards ?? 0,
      awayRedCards: args.awayRedCards ?? 0,
      isExtraTime: args.isExtraTime ?? false,
      isPenalties: args.isPenalties ?? false,
      status: args.status,
      winnerId: args.winnerId,
    });

    // Se o jogo for da fase de grupos, recalcula a tabela oficial do grupo e popula o mata-mata global
    if (match.phase === "Group") {
      await recalculateStandings(ctx, match.group, "global");
      await checkAndPopulateR32(ctx, "global");
    } else {
      // Propaga o vencedor no chaveamento de mata-mata oficial
      await propagateWinner(ctx, updatedMatch, "global");
    }

    return { success: true };
  }
});

// Busca os logs de sincronização da API externa
export const getSyncLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 15;
    return await ctx.db.query("api_sync_logs")
      .order("desc")
      .take(limit);
  }
});
