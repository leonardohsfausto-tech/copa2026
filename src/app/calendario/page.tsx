"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Loader2, MapPin, Clock, Trophy, ChevronLeft, ChevronRight, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchEditDialog } from "@/components/match-edit-dialog";

export default function CalendarioPage() {
  const matches = useQuery(api.matches.list, {});
  const [activeDateIndex, setActiveDateIndex] = useState(0);

  if (!matches) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Agrupar jogos por data
  const groupedMatches: Record<string, any[]> = {};
  matches.forEach((match: any) => {
    if (!groupedMatches[match.date]) {
      groupedMatches[match.date] = [];
    }
    groupedMatches[match.date].push(match);
  });

  // Ordenação cronológica
  const dates = Object.keys(groupedMatches).sort((a, b) => {
    const [da, ma, ya] = a.split("/").map(Number);
    const [db, mb, yb] = b.split("/").map(Number);
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
  });

  const activeDate = dates[activeDateIndex];
  const activeMatches = groupedMatches[activeDate] || [];

  const nextDay = () => setActiveDateIndex((prev) => (prev + 1) % dates.length);
  const prevDay = () => setActiveDateIndex((prev) => (prev - 1 + dates.length) % dates.length);

  return (
    <div className="space-y-4 md:space-y-8 pb-20 px-4 md:px-8 max-w-[1800px]">
      
      {/* PAGINAÇÃO COMPACTA */}
      <div className="flex items-center justify-center gap-6 py-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={prevDay}
          className="rounded-full border-white/5 bg-white/5 hover:bg-primary/10 hover:border-primary/50 text-muted-foreground hover:text-primary w-10 h-10 transition-all"
        >
          <ChevronLeft size={20} />
        </Button>
        
        <div className="flex flex-col items-center">
            <div className="text-xl md:text-3xl font-black italic bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent px-2 md:px-6">
                {activeDate}
            </div>
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={nextDay}
          className="rounded-full border-white/5 bg-white/5 hover:bg-primary/10 hover:border-primary/50 text-muted-foreground hover:text-primary w-10 h-10 transition-all"
        >
          <ChevronRight size={20} />
        </Button>
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" /> 
                CONFRONTOS AGENDADOS
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-border/40 to-transparent" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {activeMatches.map((match: any) => (
                <CalendarMatchCard key={match._id} match={match} />
            ))}
        </div>
      </div>
    </div>
  );
}

function CalendarMatchCard({ match }: { match: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const getPhaseName = (phase: string) => {
    switch (phase) {
      case "Group": return `Grupo ${match.group}`;
      case "R32": return "16avos de Final";
      case "R16": return "Oitavas de Final";
      case "Quarter": return "Quartas de Final";
      case "Semi": return "Semifinal";
      case "3rdPlace": return "3º Lugar";
      case "Final": return "Grande Final";
      default: return phase;
    }
  };

  const isKnockout = match.phase !== "Group";

  // Mapeamento de estilos por fase para consistência com o mata-mata
  const phaseStyles: Record<string, { border: string, bg: string, badge: string }> = {
    R32: { border: "border-blue-500/20", bg: "bg-blue-500/5", badge: "bg-blue-500/20 text-blue-500" },
    R16: { border: "border-amber-500/20", bg: "bg-amber-500/5", badge: "bg-amber-500/20 text-amber-500" },
    Quarter: { border: "border-purple-500/20", bg: "bg-purple-500/5", badge: "bg-purple-500/20 text-purple-500" },
    Semi: { border: "border-rose-500/20", bg: "bg-rose-500/5", badge: "bg-rose-500/20 text-rose-500" },
    "3rdPlace": { border: "border-slate-500/20", bg: "bg-slate-500/5", badge: "bg-slate-500/20 text-slate-400" },
    Final: { border: "border-yellow-500/20", bg: "bg-yellow-500/5", badge: "bg-yellow-500/20 text-yellow-500" },
    Group: { border: "border-border/40", bg: "bg-card/30", badge: "bg-primary/20 text-primary" }
  };

  const style = phaseStyles[match.phase] || phaseStyles.Group;

  return (
    <>
        <Card className={cn(
        "transition-all group overflow-hidden shadow-2xl backdrop-blur-md",
        style.bg,
        style.border,
        "hover:border-primary/40 hover:bg-card/50"
    )}>
        <CardContent className="p-0">
            <div className="p-3 md:p-5 border-b border-border/10 bg-white/[0.02] flex justify-between items-center">
                <div className="flex items-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                    <Badge className={cn(
                        "border-none rounded-sm px-2 md:px-3 py-0.5 h-4 md:h-5 flex items-center text-[8px] md:text-[9px]",
                        style.badge
                    )}>
                        {isKnockout && <Trophy size={8} className="mr-1 md:mr-1.5" />}
                        {getPhaseName(match.phase)}
                    </Badge>
                    <div className="w-1 h-1 rounded-full bg-border/40" />
                    <span className="flex items-center gap-1 md:gap-1.5 truncate max-w-[100px] md:max-w-[200px] opacity-70"><MapPin size={10} className="shrink-0" /> {match.city}</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 text-primary font-black italic text-xs md:text-sm tracking-tighter shrink-0">
                    <Clock size={14} />
                    {match.time}
                </div>
            </div>
            
            <div className="p-4 md:p-10 flex items-center justify-between gap-2 md:gap-8">
            <div className="flex-1 flex items-center gap-2 md:gap-6 min-w-0">
                {match.homeTeam ? (
                    <>
                        <img src={match.homeTeam.flag} className="w-8 h-5 md:w-14 md:h-9 rounded shadow-xl object-cover ring-1 md:ring-2 ring-white/10 shrink-0" alt="" />
                        <span className="text-[10px] md:text-sm font-black uppercase text-foreground tracking-tight truncate">{match.homeTeam.name}</span>
                    </>
                ) : (
                    <span className="text-[8px] md:text-xs font-black uppercase text-muted-foreground/40 italic tracking-widest truncate">{match.homeTeamPlaceholder || "TBD"}</span>
                )}
            </div>
            
            <button 
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-2 md:gap-4 hover:scale-105 transition-transform group/btn relative shrink-0"
            >
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-muted/40 group-hover/btn:bg-primary/20 flex items-center justify-center font-black text-xl md:text-3xl border border-white/5 shadow-2xl transition-colors">
                    {match.homeGoals ?? "-"}
                </div>
                <span className="text-muted-foreground/20 font-black italic text-[10px] md:text-sm group-hover/btn:text-primary transition-colors">VS</span>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-muted/40 group-hover/btn:bg-primary/20 flex items-center justify-center font-black text-xl md:text-3xl border border-white/5 shadow-2xl transition-colors">
                    {match.awayGoals ?? "-"}
                </div>
            </button>

            <div className="flex-1 flex items-center justify-end gap-2 md:gap-6 min-w-0">
                {match.awayTeam ? (
                    <>
                        <span className="text-[10px] md:text-sm font-black uppercase text-foreground tracking-tight truncate text-right">{match.awayTeam.name}</span>
                        <img src={match.awayTeam.flag} className="w-8 h-5 md:w-14 md:h-9 rounded shadow-xl object-cover ring-1 md:ring-2 ring-white/10 shrink-0" alt="" />
                    </>
                ) : (
                    <span className="text-[8px] md:text-xs font-black uppercase text-muted-foreground/40 italic tracking-widest text-right truncate">{match.awayTeamPlaceholder || "TBD"}</span>
                )}
            </div>
            </div>
        </CardContent>
        </Card>

        <MatchEditDialog 
            match={match}
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
        />
    </>
  );
}
