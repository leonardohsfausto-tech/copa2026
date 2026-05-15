import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = mutation({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || "default_user";

    console.log(`Iniciando Seed para usuário: ${userId}...`);
    
    const existingTeams = await ctx.db.query("teams")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    const existingMatches = await ctx.db.query("matches")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    
    console.log(`Deletando ${existingTeams.length} times e ${existingMatches.length} partidas...`);
    for (const team of existingTeams) await ctx.db.delete(team._id);
    for (const match of existingMatches) await ctx.db.delete(match._id);
    console.log("Limpeza concluída.");

    const groups = {
      A: ["México", "África do Sul", "Coreia do Sul", "República Tcheca"],
      B: ["Canadá", "Bósnia", "Catar", "Suíça"],
      C: ["Brasil", "Marrocos", "Haiti", "Escócia"],
      D: ["Estados Unidos", "Paraguai", "Austrália", "Turquia"],
      E: ["Alemanha", "Curaçao", "Costa do Marfim", "Equador"],
      F: ["Holanda", "Japão", "Suécia", "Tunísia"],
      G: ["Bélgica", "Egito", "Irã", "Nova Zelândia"],
      H: ["Espanha", "Cabo Verde", "Arábia Saudita", "Uruguai"],
      I: ["França", "Senegal", "Iraque", "Noruega"],
      J: ["Argentina", "Argélia", "Áustria", "Jordânia"],
      K: ["Portugal", "RD Congo", "Uzbequistão", "Colômbia"],
      L: ["Inglaterra", "Croácia", "Gana", "Panamá"],
    };

    const teamIds: Record<string, any> = {};
    for (const [group, teams] of Object.entries(groups)) {
      teamIds[group] = [];
      for (const teamName of teams) {
        const id = await ctx.db.insert("teams", {
          userId,
          name: teamName,
          group,
          flag: `https://flagcdn.com/w80/${getCountryCode(teamName)}.png`,
          played: 0, wins: 0, draws: 0, losses: 0, points: 0,
          goalsScored: 0, goalsAgainst: 0, goalDifference: 0, rank: 0,
          fifaRanking: Math.floor(Math.random() * 50) + 1, // Exemplo de ranking
          yellowCards: 0,
          redCards: 0,
        });
        teamIds[group].push(id);
      }
    }

    const venues = [
      { stadium: "Estádio Azteca", city: "Cidade do México", country: "México" },
      { stadium: "MetLife Stadium", city: "Nova York", country: "EUA" },
      { stadium: "BC Place", city: "Vancouver", country: "Canadá" },
      { stadium: "SoFi Stadium", city: "Los Angeles", country: "EUA" },
      { stadium: "Lumen Field", city: "Seattle", country: "EUA" },
      { stadium: "Hard Rock Stadium", city: "Miami", country: "EUA" },
    ];

    const nameToId: Record<string, any> = {};
    for (const [group, ids] of Object.entries(teamIds)) {
      groups[group as keyof typeof groups].forEach((name, i) => {
        nameToId[name] = ids[i];
      });
    }

    const stadiums: Record<string, { name: string; country: string }> = {
      "Cidade do México": { name: "Estádio Azteca", country: "México" },
      "Guadalajara": { name: "Estádio Akron", country: "México" },
      "Toronto": { name: "BMO Field", country: "Canadá" },
      "Los Angeles": { name: "SoFi Stadium", country: "EUA" },
      "Vancouver": { name: "BC Place", country: "Canadá" },
      "San Francisco": { name: "Levi's Stadium", country: "EUA" },
      "Nova York": { name: "MetLife Stadium", country: "EUA" },
      "Boston": { name: "Gillette Stadium", country: "EUA" },
      "Houston": { name: "NRG Stadium", country: "EUA" },
      "Dallas": { name: "AT&T Stadium", country: "EUA" },
      "Filadélfia": { name: "Lincoln Financial Field", country: "EUA" },
      "Monterrey": { name: "Estádio BBVA", country: "México" },
      "Atlanta": { name: "Mercedes-Benz Stadium", country: "EUA" },
      "Seattle": { name: "Lumen Field", country: "EUA" },
      "Miami": { name: "Hard Rock Stadium", country: "EUA" },
      "Kansas City": { name: "Arrowhead Stadium", country: "EUA" },
    };

    const matchData = [
      { d: "11/06/2026", t: "16:00", h: "México", a: "África do Sul", g: "A", c: "Cidade do México" },
      { d: "11/06/2026", t: "23:00", h: "Coreia do Sul", a: "República Tcheca", g: "A", c: "Guadalajara" },
      { d: "12/06/2026", t: "16:00", h: "Canadá", a: "Bósnia", g: "B", c: "Toronto" },
      { d: "12/06/2026", t: "22:00", h: "Estados Unidos", a: "Paraguai", g: "D", c: "Los Angeles" },
      { d: "13/06/2026", t: "01:00", h: "Austrália", a: "Turquia", g: "D", c: "Vancouver" },
      { d: "13/06/2026", t: "16:00", h: "Catar", a: "Suíça", g: "B", c: "San Francisco" },
      { d: "13/06/2026", t: "19:00", h: "Brasil", a: "Marrocos", g: "C", c: "Nova York" },
      { d: "13/06/2026", t: "22:00", h: "Haiti", a: "Escócia", g: "C", c: "Boston" },
      { d: "14/06/2026", t: "14:00", h: "Alemanha", a: "Curaçao", g: "E", c: "Houston" },
      { d: "14/06/2026", t: "17:00", h: "Holanda", a: "Japão", g: "F", c: "Dallas" },
      { d: "14/06/2026", t: "20:00", h: "Costa do Marfim", a: "Equador", g: "E", c: "Filadélfia" },
      { d: "14/06/2026", t: "23:00", h: "Suécia", a: "Tunísia", g: "F", c: "Monterrey" },
      { d: "15/06/2026", t: "13:00", h: "Espanha", a: "Cabo Verde", g: "H", c: "Atlanta" },
      { d: "15/06/2026", t: "16:00", h: "Bélgica", a: "Egito", g: "G", c: "Seattle" },
      { d: "15/06/2026", t: "19:00", h: "Arábia Saudita", a: "Uruguai", g: "H", c: "Miami" },
      { d: "15/06/2026", t: "22:00", h: "Irã", a: "Nova Zelândia", g: "G", c: "Los Angeles" },
      { d: "16/06/2026", t: "16:00", h: "França", a: "Senegal", g: "I", c: "Nova York" },
      { d: "16/06/2026", t: "19:00", h: "Iraque", a: "Noruega", g: "I", c: "Boston" },
      { d: "16/06/2026", t: "22:00", h: "Argentina", a: "Argélia", g: "J", c: "Kansas City" },
      { d: "17/06/2026", t: "01:00", h: "Áustria", a: "Jordânia", g: "J", c: "San Francisco" },
      { d: "17/06/2026", t: "14:00", h: "Portugal", a: "RD Congo", g: "K", c: "Houston" },
      { d: "17/06/2026", t: "17:00", h: "Inglaterra", a: "Croácia", g: "L", c: "Dallas" },
      { d: "17/06/2026", t: "20:00", h: "Gana", a: "Panamá", g: "L", c: "Toronto" },
      { d: "17/06/2026", t: "23:00", h: "Uzbequistão", a: "Colômbia", g: "K", c: "Cidade do México" },
      { d: "18/06/2026", t: "13:00", h: "República Tcheca", a: "África do Sul", g: "A", c: "Atlanta" },
      { d: "18/06/2026", t: "16:00", h: "Suíça", a: "Bósnia", g: "B", c: "Los Angeles" },
      { d: "18/06/2026", t: "19:00", h: "Canadá", a: "Catar", g: "B", c: "Vancouver" },
      { d: "18/06/2026", t: "22:00", h: "México", a: "Coreia do Sul", g: "A", c: "Guadalajara" },
      { d: "19/06/2026", t: "01:00", h: "Turquia", a: "Paraguai", g: "D", c: "San Francisco" },
      { d: "19/06/2026", t: "16:00", h: "Estados Unidos", a: "Austrália", g: "D", c: "Seattle" },
      { d: "19/06/2026", t: "19:00", h: "Escócia", a: "Marrocos", g: "C", c: "Boston" },
      { d: "19/06/2026", t: "22:00", h: "Brasil", a: "Haiti", g: "C", c: "Filadélfia" },
      { d: "20/06/2026", t: "14:00", h: "Holanda", a: "Suécia", g: "F", c: "Houston" },
      { d: "20/06/2026", t: "17:00", h: "Alemanha", a: "Costa do Marfim", g: "E", c: "Toronto" },
      { d: "20/06/2026", t: "21:00", h: "Equador", a: "Curaçao", g: "E", c: "Kansas City" },
      { d: "21/06/2026", t: "01:00", h: "Tunísia", a: "Japão", g: "F", c: "Monterrey" },
      { d: "21/06/2026", t: "13:00", h: "Espanha", a: "Arábia Saudita", g: "H", c: "Atlanta" },
      { d: "21/06/2026", t: "16:00", h: "Bélgica", a: "Irã", g: "G", c: "Los Angeles" },
      { d: "21/06/2026", t: "19:00", h: "Uruguai", a: "Cabo Verde", g: "H", c: "Miami" },
      { d: "21/06/2026", t: "22:00", h: "Nova Zelândia", a: "Egito", g: "G", c: "Vancouver" },
      { d: "22/06/2026", t: "14:00", h: "Argentina", a: "Áustria", g: "J", c: "Dallas" },
      { d: "22/06/2026", t: "18:00", h: "França", a: "Iraque", g: "I", c: "Filadélfia" },
      { d: "22/06/2026", t: "21:00", h: "Noruega", a: "Senegal", g: "I", c: "Nova York" },
      { d: "23/06/2026", t: "00:00", h: "Jordânia", a: "Argélia", g: "J", c: "San Francisco" },
      { d: "23/06/2026", t: "14:00", h: "Portugal", a: "Uzbequistão", g: "K", c: "Houston" },
      { d: "23/06/2026", t: "17:00", h: "Inglaterra", a: "Gana", g: "L", c: "Boston" },
      { d: "23/06/2026", t: "20:00", h: "Panamá", a: "Croácia", g: "L", c: "Toronto" },
      { d: "23/06/2026", t: "23:00", h: "Colômbia", a: "RD Congo", g: "K", c: "Guadalajara" },
      { d: "24/06/2026", t: "16:00", h: "Suíça", a: "Canadá", g: "B", c: "Vancouver" },
      { d: "24/06/2026", t: "16:00", h: "Bósnia", a: "Catar", g: "B", c: "Seattle" },
      { d: "24/06/2026", t: "19:00", h: "Escócia", a: "Brasil", g: "C", c: "Miami" },
      { d: "24/06/2026", t: "19:00", h: "Marrocos", a: "Haiti", g: "C", c: "Atlanta" },
      { d: "24/06/2026", t: "22:00", h: "República Tcheca", a: "México", g: "A", c: "Cidade do México" },
      { d: "24/06/2026", t: "22:00", h: "África do Sul", a: "Coreia do Sul", g: "A", c: "Monterrey" },
      { d: "25/06/2026", t: "17:00", h: "Equador", a: "Alemanha", g: "E", c: "Nova York" },
      { d: "25/06/2026", t: "17:00", h: "Curaçao", a: "Costa do Marfim", g: "E", c: "Filadélfia" },
      { d: "25/06/2026", t: "20:00", h: "Tunísia", a: "Holanda", g: "F", c: "Kansas City" },
      { d: "25/06/2026", t: "20:00", h: "Japão", a: "Suécia", g: "F", c: "Dallas" },
      { d: "25/06/2026", t: "23:00", h: "Turquia", a: "Estados Unidos", g: "D", c: "Los Angeles" },
      { d: "25/06/2026", t: "23:00", h: "Paraguai", a: "Austrália", g: "D", c: "San Francisco" },
      { d: "26/06/2026", t: "16:00", h: "Noruega", a: "França", g: "I", c: "Boston" },
      { d: "26/06/2026", t: "16:00", h: "Senegal", a: "Iraque", g: "I", c: "Toronto" },
      { d: "26/06/2026", t: "21:00", h: "Uruguai", a: "Espanha", g: "H", c: "Guadalajara" },
      { d: "26/06/2026", t: "21:00", h: "Cabo Verde", a: "Arábia Saudita", g: "H", c: "Houston" },
      { d: "26/06/2026", t: "00:00", h: "Egito", a: "Irã", g: "G", c: "Seattle" },
      { d: "26/06/2026", t: "00:00", h: "Nova Zelândia", a: "Bélgica", g: "G", c: "Vancouver" },
      { d: "27/06/2026", t: "18:00", h: "Panamá", a: "Inglaterra", g: "L", c: "Nova York" },
      { d: "27/06/2026", t: "18:00", h: "Croácia", a: "Gana", g: "L", c: "Filadélfia" },
      { d: "27/06/2026", t: "20:30", h: "Colômbia", a: "Portugal", g: "K", c: "Miami" },
      { d: "27/06/2026", t: "20:30", h: "RD Congo", a: "Uzbequistão", g: "K", c: "Atlanta" },
      { d: "27/06/2026", t: "23:00", h: "Jordânia", a: "Argentina", g: "J", c: "Dallas" },
      { d: "27/06/2026", t: "23:00", h: "Argélia", a: "Áustria", g: "J", c: "Kansas City" },
    ];

    for (const m of matchData) {
      const v = stadiums[m.c];
      await ctx.db.insert("matches", {
        userId,
        group: m.g, phase: "Group", homeTeamId: nameToId[m.h], awayTeamId: nameToId[m.a],
        date: m.d, time: m.t, stadium: v.name, city: m.c, country: v.country, status: "agendado",
      });
    }

    // Knockout Stage
    const knockout = [
      { ph: "R32", h: "1A", a: "3C/D/E/F/H/I", d: "28/06/2026", t: "16:00", c: "Los Angeles", j: 73 },
      { ph: "R32", h: "1B", a: "3A/C/D/E/F/G", d: "29/06/2026", t: "17:30", c: "Boston", j: 74 },
      { ph: "R32", h: "1C", a: "2F", d: "29/06/2026", t: "22:00", c: "Monterrey", j: 75 },
      { ph: "R32", h: "1D", a: "2E", d: "29/06/2026", t: "14:00", c: "Houston", j: 76 },
      { ph: "R32", h: "1E", a: "3A/B/C/D/F", d: "30/06/2026", t: "18:00", c: "Nova York", j: 77 },
      { ph: "R32", h: "1F", a: "2C", d: "30/06/2026", t: "14:00", c: "Dallas", j: 78 },
      { ph: "R32", h: "1G", a: "3A/B/C/E/F/H", d: "30/06/2026", t: "22:00", c: "Cidade do México", j: 79 },
      { ph: "R32", h: "1H", a: "2J", d: "01/07/2026", t: "13:00", c: "Atlanta", j: 80 },
      { ph: "R32", h: "1I", a: "3C/D/E/G/H/J", d: "01/07/2026", t: "21:00", c: "San Francisco", j: 81 },
      { ph: "R32", h: "1J", a: "2H", d: "01/07/2026", t: "17:00", c: "Seattle", j: 82 },
      { ph: "R32", h: "1K", a: "3I/J/L", d: "02/07/2026", t: "20:00", c: "Toronto", j: 83 },
      { ph: "R32", h: "1L", a: "2K", d: "02/07/2026", t: "16:00", c: "Los Angeles", j: 84 },
      { ph: "R32", h: "2A", a: "2B", d: "02/07/2026", t: "00:00", c: "Vancouver", j: 85 },
      { ph: "R32", h: "2D", a: "2G", d: "03/07/2026", t: "19:00", c: "Miami", j: 86 },
      { ph: "R32", h: "2I", a: "2L", d: "03/07/2026", t: "22:30", c: "Kansas City", j: 87 },
      { ph: "R32", h: "2J", a: "2K", d: "03/07/2026", t: "15:00", c: "Dallas", j: 88 },
      
      { ph: "R16", h: "Venc R32-1", a: "Venc R32-2", d: "04/07/2026", t: "18:00", c: "Filadélfia", j: 89 },
      { ph: "R16", h: "Venc R32-3", a: "Venc R32-4", d: "04/07/2026", t: "14:00", c: "Houston", j: 90 },
      { ph: "R16", h: "Venc R32-5", a: "Venc R32-6", d: "05/07/2026", t: "17:00", c: "Nova York", j: 91 },
      { ph: "R16", h: "Venc R32-7", a: "Venc R32-8", d: "05/07/2026", t: "21:00", c: "Cidade do México", j: 92 },
      { ph: "R16", h: "Venc R32-9", a: "Venc R32-10", d: "06/07/2026", t: "16:00", c: "Dallas", j: 93 },
      { ph: "R16", h: "Venc R32-11", a: "Venc R32-12", d: "06/07/2026", t: "21:00", c: "Seattle", j: 94 },
      { ph: "R16", h: "Venc R32-13", a: "Venc R32-14", d: "07/07/2026", t: "13:00", c: "Atlanta", j: 95 },
      { ph: "R16", h: "Venc R32-15", a: "Venc R32-16", d: "07/07/2026", t: "17:00", c: "Vancouver", j: 96 },

      { ph: "Quarter", h: "Venc R16-1", a: "Venc R16-2", d: "09/07/2026", t: "17:00", c: "Boston", j: 97 },
      { ph: "Quarter", h: "Venc R16-3", a: "Venc R16-4", d: "10/07/2026", t: "16:00", c: "Los Angeles", j: 98 },
      { ph: "Quarter", h: "Venc R16-5", a: "Venc R16-6", d: "11/07/2026", t: "18:00", c: "Miami", j: 99 },
      { ph: "Quarter", h: "Venc R16-7", a: "Venc R16-8", d: "11/07/2026", t: "22:00", c: "Kansas City", j: 100 },

      { ph: "Semi", h: "Venc QF-1", a: "Venc QF-2", d: "14/07/2026", t: "16:00", c: "Dallas", j: 101 },
      { ph: "Semi", h: "Venc QF-3", a: "Venc QF-4", d: "15/07/2026", t: "16:00", c: "Atlanta", j: 102 },

      { ph: "3rdPlace", h: "Perd SF-1", a: "Perd SF-2", d: "18/07/2026", t: "18:00", c: "Miami", j: 103 },
      { ph: "Final", h: "Venc SF-1", a: "Venc SF-2", d: "19/07/2026", t: "16:00", c: "Nova York", j: 104 },
    ];

    for (const m of knockout) {
      const v = stadiums[m.c];
      await ctx.db.insert("matches", {
        userId,
        group: "Knockout", phase: m.ph, homeTeamPlaceholder: m.h, awayTeamPlaceholder: m.a,
        date: m.d, time: m.t, stadium: v.name, city: m.c, country: v.country, status: "agendado",
      });
    }
  },
});

function getCountryCode(name: string): string {
  const mapping: Record<string, string> = {
    "México": "mx", "África do Sul": "za", "Coreia do Sul": "kr", "República Tcheca": "cz",
    "Canadá": "ca", "Bósnia": "ba", "Catar": "qa", "Suíça": "ch",
    "Brasil": "br", "Marrocos": "ma", "Haiti": "ht", "Escócia": "gb-sct",
    "Estados Unidos": "us", "Paraguai": "py", "Austrália": "au", "Turquia": "tr",
    "Alemanha": "de", "Curaçao": "cw", "Costa do Marfim": "ci", "Equador": "ec",
    "Holanda": "nl", "Japão": "jp", "Suécia": "se", "Tunísia": "tn",
    "Bélgica": "be", "Egito": "eg", "Irã": "ir", "Nova Zelândia": "nz",
    "Espanha": "es", "Cabo Verde": "cv", "Arábia Saudita": "sa", "Uruguai": "uy",
    "França": "fr", "Senegal": "sn", "Iraque": "iq", "Noruega": "no",
    "Argentina": "ar", "Argélia": "dz", "Áustria": "at", "Jordânia": "jo",
    "Portugal": "pt", "RD Congo": "cd", "Uzbequistão": "uz", "Colômbia": "co",
    "Inglaterra": "gb-eng", "Croácia": "hr", "Gana": "gh", "Panamá": "pa",
  };
  return mapping[name] || "un";
}
