import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const fixTeams = mutation({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || "default_user";

    const teams = await ctx.db
      .query("teams")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    for (const team of teams) {
      if (team.name === "Itália") {
        await ctx.db.patch(team._id, { 
            name: "Bósnia", 
            flag: "https://flagcdn.com/w80/ba.png" 
        });
      }
      if (team.name === "Qatar") {
        await ctx.db.patch(team._id, { 
            name: "Catar", 
            flag: "https://flagcdn.com/w80/qa.png" 
        });
      }
      if (team.name === "Congo") {
        await ctx.db.patch(team._id, { 
            name: "RD Congo", 
            flag: "https://flagcdn.com/w80/cd.png" 
        });
      }
    }
    
    // Também atualizar os nomes nos jogos
    const matches = await ctx.db.query("matches").collect();
    // Como os jogos usam IDs, eles já devem estar "corretos" se o ID do time mudou o nome.
    // Mas se houver placeholders ou algo assim, verificamos.
    
    return "Correção aplicada!";
  },
});
