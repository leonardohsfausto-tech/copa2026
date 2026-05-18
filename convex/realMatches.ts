import { action, internalAction, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Ação (Action) para buscar dados de uma API externa de esportes
export const syncRealMatches = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Iniciando sincronização de resultados com a API esportiva...");

    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      console.error("API_FOOTBALL_KEY não encontrada nas variáveis de ambiente do Convex.");
      return;
    }

    try {
      // Fazendo a requisição para a API-Football (Liga 1 = World Cup, Temporada 2026)
      const response = await fetch("https://v3.football.api-sports.io/fixtures?league=1&season=2026", {
        method: "GET",
        headers: {
          "x-apisports-key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na API-Football: ${response.statusText}`);
      }

      const data = await response.json();

      // Transformar os dados recebidos para o nosso formato interno
      const formattedMatches = data.response.map((fixture: any) => ({
        externalMatchId: fixture.fixture.id,
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeGoals: fixture.goals.home ?? 0,
        awayGoals: fixture.goals.away ?? 0,
        status: fixture.fixture.status.short === "FT" || fixture.fixture.status.short === "AET" || fixture.fixture.status.short === "PEN" ? "encerrado" : 
                (fixture.fixture.status.short === "NS" ? "agendado" : "ao vivo"),
        // Os eventos poderiam ser buscados em um endpoint específico de eventos ou se estiverem incluídos na resposta
        events: fixture.events ? fixture.events.map((e: any) => ({
          teamName: e.team.name,
          type: e.type.toLowerCase() === "goal" ? "goal" : (e.detail.toLowerCase().includes("yellow") ? "yellow_card" : "red_card"),
          playerName: e.player.name,
          minute: e.time.elapsed
        })) : []
      }));

      // Dispara a mutation interna para atualizar o Perfil Global
      await ctx.runMutation(internal.realMatches.updateGlobalMatches, {
        apiMatchesData: formattedMatches,
      });
      
      console.log(`Sincronização concluída com sucesso. ${formattedMatches.length} jogos processados.`);
    } catch (error) {
      console.error("Falha ao buscar dados da API de resultados:", error);
    }
  },
});

// Action PÚBLICA para o admin acionar a sincronização manual
export const triggerManualSync = action({
  args: {},
  handler: async (ctx) => {
    await ctx.runAction(internal.realMatches.syncRealMatches, {});
    return { success: true };
  },
});

// Mutation interna para atualizar o banco de dados (Perfil Global isolado)
export const updateGlobalMatches = internalMutation({
  args: {
    apiMatchesData: v.array(v.any()), // Tipagem flexível para a demonstração
  },
  handler: async (ctx, args) => {
    console.log("Atualizando base isolada do Perfil Global com placares reais...");

    // Buscar todos os times globais para mapear pelo nome
    const globalTeams = await ctx.db.query("teams")
      .withIndex("by_user", (q) => q.eq("userId", undefined))
      .collect();

    for (const matchData of args.apiMatchesData) {
      // Procurar IDs reais dos times pelo nome (pode haver divergências na tradução, 
      // precisaria de um mapeamento confiável no futuro)
      const homeTeamDoc = globalTeams.find(t => t.name.toLowerCase() === matchData.homeTeam.toLowerCase());
      const awayTeamDoc = globalTeams.find(t => t.name.toLowerCase() === matchData.awayTeam.toLowerCase());

      if (!homeTeamDoc || !awayTeamDoc) continue;

      const globalMatches = await ctx.db.query("matches")
        .withIndex("by_user", (q) => q.eq("userId", undefined))
        .collect();
      
      // Assumindo que pegamos a partida que envolve esses dois times
      const targetMatch = globalMatches.find(m => 
        (m.homeTeamId === homeTeamDoc._id && m.awayTeamId === awayTeamDoc._id) || 
        (m.homeTeamId === awayTeamDoc._id && m.awayTeamId === homeTeamDoc._id)
      );

      if (targetMatch && targetMatch.homeTeamId && targetMatch.awayTeamId) {
        // Atualiza os placares do jogo global
        await ctx.db.patch(targetMatch._id, {
          homeGoals: matchData.homeGoals,
          awayGoals: matchData.awayGoals,
          status: matchData.status,
        });

        // 2. Registrar eventos (gols, assistências, cartões) na tabela estruturada
        for (const event of matchData.events) {
          const teamId = event.teamName.toLowerCase() === homeTeamDoc.name.toLowerCase() ? targetMatch.homeTeamId : targetMatch.awayTeamId;
          
          await ctx.db.insert("match_events", {
            matchId: targetMatch._id,
            teamId: teamId,
            type: event.type,
            playerName: event.playerName,
            minute: event.minute,
          });
        }
      }
    }
  },
});

// Query para ler os eventos de uma partida específica (para as Telas de Estatísticas Oficiais futuramente)
export const getMatchEvents = query({
  args: {
    matchId: v.id("matches"),
    userId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("match_events")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  }
});

// Query para buscar as estatísticas globais (Artilharia, Assistências, Cartões)
export const getGlobalStats = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("match_events")
      .withIndex("by_user", (q) => q.eq("userId", undefined))
      .collect();

    const teams = await ctx.db.query("teams")
      .withIndex("by_user", (q) => q.eq("userId", undefined))
      .collect();
    
    const teamMap: Record<string, any> = {};
    for (const t of teams) {
      teamMap[t._id] = t;
    }

    const aggregate = (type: string) => {
      const filtered = events.filter(e => e.type === type);
      const counts: Record<string, { playerName: string, team: any, count: number }> = {};
      for (const item of filtered) {
        const key = `${item.playerName}-${item.teamId}`;
        if (!counts[key]) {
          counts[key] = { playerName: item.playerName, team: teamMap[item.teamId], count: 0 };
        }
        counts[key].count += 1;
      }
      return Object.values(counts).sort((a, b) => b.count - a.count);
    };

    return {
      topScorers: aggregate("goal").slice(0, 15),
      topAssists: aggregate("assist").slice(0, 15),
      yellowCards: aggregate("yellow_card").slice(0, 15),
      redCards: aggregate("red_card").slice(0, 15),
    };
  }
});
