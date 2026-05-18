import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  teams: defineTable({
    userId: v.optional(v.string()), // null para o template global
    name: v.string(),
    group: v.string(),
    flag: v.string(),
    played: v.number(),
    wins: v.number(),
    draws: v.number(),
    losses: v.number(),
    points: v.number(),
    goalsScored: v.number(),
    goalsAgainst: v.number(),
    goalDifference: v.number(),
    rank: v.number(), // position in group
    fifaRanking: v.optional(v.number()),
    yellowCards: v.optional(v.number()),
    redCards: v.optional(v.number()),
  })
    .index("by_group", ["group"])
    .index("by_user", ["userId"]),
  matches: defineTable({
    userId: v.optional(v.string()),
    group: v.string(), // "A", "B", etc. or "Knockout"
    phase: v.string(), // "Group", "R32", "R16", "Quarter", "Semi", "3rdPlace", "Final"
    homeTeamId: v.optional(v.id("teams")),
    awayTeamId: v.optional(v.id("teams")),
    homeTeamPlaceholder: v.optional(v.string()), // e.g. "1A", "2B"
    awayTeamPlaceholder: v.optional(v.string()),
    homeGoals: v.optional(v.number()),
    awayGoals: v.optional(v.number()),
    homeYellowCards: v.optional(v.number()),
    awayYellowCards: v.optional(v.number()),
    homeRedCards: v.optional(v.number()),
    awayRedCards: v.optional(v.number()),
    isExtraTime: v.optional(v.boolean()),
    isPenalties: v.optional(v.boolean()),
    date: v.string(),
    time: v.string(),
    stadium: v.string(),
    city: v.string(),
    country: v.string(),
    status: v.string(), // "agendado", "ao vivo", "encerrado"
    winnerId: v.optional(v.id("teams")),
  })
    .index("by_user", ["userId"])
    .index("by_phase", ["phase"]),
  standings: defineTable({
    userId: v.optional(v.string()),
    groupId: v.string(),
    teamId: v.id("teams"),
    played: v.number(),
    won: v.number(),
    drawn: v.number(),
    lost: v.number(),
    goalsFor: v.number(),
    goalsAgainst: v.number(),
    goalDifference: v.number(),
    points: v.number(),
  }).index("by_user", ["userId"]),
  knockout: defineTable({
    userId: v.optional(v.string()),
    matchId: v.id("matches"),
    nextMatchId: v.optional(v.id("matches")),
    position: v.string(), // e.g. "top-left"
  }).index("by_user", ["userId"]),
  favorites: defineTable({
    userId: v.string(),
    teamId: v.id("teams"),
  }).index("by_user", ["userId"]),
  match_events: defineTable({
    userId: v.optional(v.string()), // null para o template global
    matchId: v.id("matches"),
    teamId: v.id("teams"),
    type: v.string(), // "goal", "assist", "yellow_card", "red_card"
    playerName: v.string(),
    minute: v.number(),
  }).index("by_match", ["matchId"])
    .index("by_user", ["userId"]),
  push_subscriptions: defineTable({
    userId: v.optional(v.string()), // Optional, pois usuários deslogados também poderiam receber, mas o saas foca em usuários
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
  }).index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),
  api_sync_logs: defineTable({
    timestamp: v.number(),
    status: v.string(), // "sucesso" | "erro"
    message: v.string(),
    matchesSynced: v.optional(v.number()),
  }),
});
