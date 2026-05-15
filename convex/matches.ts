import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

export const list = query({
  args: { 
    group: v.optional(v.string()),
    phase: v.optional(v.string())
  },
  handler: async (ctx: any, args: { group?: string, phase?: string }) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || "default_user";

    let matchesQuery = ctx.db.query("matches")
      .withIndex("by_user", (q: any) => q.eq("userId", userId));
    
    if (args.phase) {
      matchesQuery = matchesQuery.filter((q: any) => q.eq(q.field("phase"), args.phase));
    } else if (args.group) {
      matchesQuery = matchesQuery.filter((q: any) => q.eq(q.field("group"), args.group));
    }
    
    const matches = await matchesQuery.collect();
    
    return await Promise.all(
      matches.map(async (match: any) => {
        const homeTeam = match.homeTeamId ? await ctx.db.get(match.homeTeamId) : null;
        const awayTeam = match.awayTeamId ? await ctx.db.get(match.awayTeamId) : null;
        return { ...match, homeTeam, awayTeam };
      })
    );
  },
});

export const updateScore = mutation({
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
    status: v.string(), 
    winnerId: v.optional(v.id("teams")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autorizado");
    const userId = identity.subject;

    const match = await ctx.db.get(args.matchId);
    if (!match || match.userId !== userId) throw new Error("Partida não encontrada ou acesso negado");

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

    if (match.phase === "Group") {
      await recalculateStandings(ctx, match.group, userId);
      await checkAndPopulateR32(ctx, userId);
    } else {
      await propagateWinner(ctx, updatedMatch, userId);
    }
  },
});

async function recalculateStandings(ctx: any, group: string, userId: string) {
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
        goalDifference: 0,
        yellowCards: 0,
        redCards: 0,
        fifaRanking: t.fifaRanking || 99
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
    h.yellowCards += (m.homeYellowCards || 0);
    a.yellowCards += (m.awayYellowCards || 0);
    h.redCards += (m.homeRedCards || 0);
    a.redCards += (m.awayRedCards || 0);
    
    if (m.homeGoals > m.awayGoals) {
        h.points += 3; h.wins++; a.losses++;
    } else if (m.homeGoals < m.awayGoals) {
        a.points += 3; a.wins++; h.losses++;
    } else {
        h.points += 1; a.points += 1; h.draws++; a.draws++;
    }
  });

  const sorted = Object.values(stats).sort((a: any, b: any) => {
    // 0. Pontos
    if (b.points !== a.points) return b.points - a.points;

    // 1. Confronto Direto (apenas para 2 times empatados por simplicidade técnica, mas robusto)
    const directMatch = matches.find((m: any) => 
      m.status === "encerrado" &&
      ((m.homeTeamId === a.id && m.awayTeamId === b.id) || 
       (m.homeTeamId === b.id && m.awayTeamId === a.id))
    );
    if (directMatch) {
      const isAHome = directMatch.homeTeamId === a.id;
      const aGoals = isAHome ? directMatch.homeGoals : directMatch.awayGoals;
      const bGoals = isAHome ? directMatch.awayGoals : directMatch.homeGoals;
      if (aGoals !== bGoals) return bGoals - aGoals;
    }

    // 2. Saldo de Gols
    const gdA = a.goalsScored - a.goalsAgainst;
    const gdB = b.goalsScored - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;

    // 3. Mais gols pró
    if (b.goalsScored !== a.goalsScored) return b.goalsScored - a.goalsScored;

    // 4. Menos cartões (Fair Play)
    const cardsA = a.yellowCards + a.redCards;
    const cardsB = b.yellowCards + b.redCards;
    if (cardsA !== cardsB) return cardsA - cardsB;

    // 5. FIFA Ranking (menor é melhor)
    return a.fifaRanking - b.fifaRanking;
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

async function checkAndPopulateR32(ctx: any, userId: string) {
  const allGroupMatches = await ctx.db.query("matches")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("phase"), "Group")).collect();
  const finishedMatches = allGroupMatches.filter((m: any) => m.status === "encerrado");
  
  // O Mundial 2026 tem 72 jogos na fase de grupos (12 grupos x 6 jogos)
  if (finishedMatches.length < 72) return;

  const teams = await ctx.db.query("teams")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();
  const r32Matches = await ctx.db.query("matches")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("phase"), "R32")).collect();
  
  // 1. Identificar todos os 1º, 2º e 3º de cada grupo
  const groupStats: Record<string, any[]> = {};
  for (const team of teams) {
    if (!groupStats[team.group]) groupStats[team.group] = [];
    groupStats[team.group].push(team);
  }

  const firsts: Record<string, any> = {};
  const seconds: Record<string, any> = {};
  const thirds: any[] = [];

  for (const group of Object.keys(groupStats)) {
    const sorted = groupStats[group].sort((a, b) => b.rank - a.rank); // rank 1 is best
    // Na verdade o seed.ts coloca rank 1, 2, 3, 4. 
    // Vamos garantir que pegamos pelo rank correto.
    const t1 = sorted.find((t: any) => t.rank === 1);
    const t2 = sorted.find((t: any) => t.rank === 2);
    const t3 = sorted.find((t: any) => t.rank === 3);
    
    if (t1) firsts[group] = t1;
    if (t2) seconds[group] = t2;
    if (t3) thirds.push(t3);
  }

  // 2. Rankear os melhores terceiros
  const bestThirds = thirds.sort((a, b) => 
    b.points - a.points || b.goalDifference - a.goalDifference || b.goalsScored - a.goalsScored
  ).slice(0, 8);

  const usedThirds = new Set<string>();

  for (const match of r32Matches) {
    let homeId = match.homeTeamId;
    let awayId = match.awayTeamId;

    const fillTeam = (placeholder: string) => {
      // Caso 1: 1A, 2B, etc.
      const directMatch = placeholder.match(/^([12])([A-L])$/);
      if (directMatch) {
        const rank = parseInt(directMatch[1]);
        const group = directMatch[2];
        const team = teams.find((t: any) => t.group === group && t.rank === rank);
        return team?._id;
      }

      // Caso 2: 3A/B/C/D... (Melhores terceiros)
      if (placeholder.startsWith("3")) {
        const eligibleGroups = placeholder.substring(1).split("/");
        // Encontra o melhor terceiro disponível que pertença a um desses grupos
        const winnerThird = bestThirds.find((t: any) => 
            eligibleGroups.includes(t.group) && !usedThirds.has(t._id)
        );
        if (winnerThird) {
            usedThirds.add(winnerThird._id);
            return winnerThird._id;
        }
      }

      return null;
    };

    if (!homeId && match.homeTeamPlaceholder) {
      homeId = fillTeam(match.homeTeamPlaceholder);
    }
    if (!awayId && match.awayTeamPlaceholder) {
      awayId = fillTeam(match.awayTeamPlaceholder);
    }

    if (homeId || awayId) {
      await ctx.db.patch(match._id, { homeTeamId: homeId, awayTeamId: awayId });
    }
  }
}

async function propagateWinner(ctx: any, finishedMatch: any, userId: string) {
  if (finishedMatch.status !== "encerrado" || !finishedMatch.winnerId) return;

  const allMatches = await ctx.db.query("matches")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();
  
  // Encontrar qual é o índice deste jogo na fase atual para resolver placeholders como "Venc R32-1"
  const samePhaseMatches = allMatches
    .filter((m: any) => m.phase === finishedMatch.phase)
    .sort((a: any, b: any) => {
        const parseDateTime = (d: string, t: string) => {
            const [day, month, year] = d.split("/").map(Number);
            const [hour, min] = t.split(":").map(Number);
            return new Date(year, month - 1, day, hour, min).getTime();
        };
        return parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time);
    });
  
  const matchIndex = samePhaseMatches.findIndex((m: any) => m._id === finishedMatch._id) + 1;
  const phaseMap: Record<string, string> = {
    "R32": "R32",
    "R16": "R16",
    "Quarter": "QF",
    "Semi": "SF",
    "Final": "F"
  };
  
  const phaseKey = phaseMap[finishedMatch.phase] || finishedMatch.phase;
  const winnerPlaceholder = `Venc ${phaseKey}-${matchIndex}`;
  const loserPlaceholder = `Perd ${phaseKey}-${matchIndex}`;

  for (const match of allMatches) {
    let update: any = {};
    if (match.homeTeamPlaceholder === winnerPlaceholder) update.homeTeamId = finishedMatch.winnerId;
    if (match.awayTeamPlaceholder === winnerPlaceholder) update.awayTeamId = finishedMatch.winnerId;
    
    // Para disputa de 3º lugar (perdedores das semis)
    if (finishedMatch.phase === "Semi") {
        const loserId = finishedMatch.winnerId === finishedMatch.homeTeamId ? finishedMatch.awayTeamId : finishedMatch.homeTeamId;
        if (match.homeTeamPlaceholder === loserPlaceholder) update.homeTeamId = loserId;
        if (match.awayTeamPlaceholder === loserPlaceholder) update.awayTeamId = loserId;
    }

    if (Object.keys(update).length > 0) {
      await ctx.db.patch(match._id, update);
    }
  }
}
