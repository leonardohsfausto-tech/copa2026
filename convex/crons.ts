import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Sincronização automatizada da API Football desativada devido às limitações do plano free para 2026.
/*
crons.hourly(
  "sync-real-matches",
  { minuteUTC: 0 },
  internal.realMatches.syncRealMatches
);
*/

export default crons;
