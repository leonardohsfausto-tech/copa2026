import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Agendamento para buscar dados de APIs esportivas de forma programada
// Neste exemplo, configuramos para rodar a cada hora (minuto 0)
crons.hourly(
  "sync-real-matches",
  { minuteUTC: 0 },
  internal.realMatches.syncRealMatches
);

export default crons;
