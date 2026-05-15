"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { MatchEditDialog } from "@/components/match-edit-dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MataMataPage() {
  const allMatches = useQuery(api.matches.list, {});
  const [activeTab, setActiveTab] = useState("R32");

  const phases = [
    { id: "R32", name: "16avos", width: "w-full md:w-80" },
    { id: "R16", name: "Oitavas", width: "w-full md:w-72" },
    { id: "Quarter", name: "Quartas", width: "w-full md:w-72" },
    { id: "Semi", name: "Semis", width: "w-full md:w-72" },
    { id: "Final", name: "Finais", width: "w-full md:w-72" },
  ];

  const groupedMatches = useMemo(() => {
    if (!allMatches) return {};
    return allMatches.reduce((acc: any, match: any) => {
      if (!acc[match.phase]) acc[match.phase] = [];
      acc[match.phase].push(match);
      return acc;
    }, {});
  }, [allMatches]);

  if (!allMatches) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderPhase = (phaseId: string, phaseName: string, phaseWidth: string, view: string) => {
    const matches = [...(groupedMatches[phaseId] || [])];
    if (phaseId === "Final") {
        matches.push(...(groupedMatches["3rdPlace"] || []));
    }
    
    const sortedMatches = matches.sort((a: any, b: any) => {
      const parseDateTime = (d: string, t: string) => {
          const [day, month, year] = d.split("/").map(Number);
          const [hour, min] = t.split(":").map(Number);
          return new Date(year, month - 1, day, hour, min).getTime();
      };
      return parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time);
    });

    return (
        <div key={`${view}-${phaseId}`} className={cn("flex flex-col gap-6", phaseWidth)}>
          <div className="hidden md:block">
            <PhaseHeader name={phaseName} />
          </div>
          <div className={cn(
            "flex flex-col gap-4",
            phaseId !== "R32" && "md:justify-around flex-1"
          )}>
            {sortedMatches.length > 0 ? (
              sortedMatches.map((match: any, i: number) => (
                <KnockoutMatchCard 
                  key={`${view}-${phaseId}-${match._id}`} 
                  match={match}
                  color={
                    match.phase === "R32" ? (i < 4 ? "border-l-blue-500" : i < 8 ? "border-l-emerald-500" : i < 12 ? "border-l-lime-500" : "border-l-red-500") :
                    match.phase === "R16" ? "border-l-amber-500" :
                    match.phase === "Quarter" ? "border-l-purple-500" :
                    match.phase === "Semi" ? "border-l-rose-500" : 
                    match.phase === "3rdPlace" ? "border-l-slate-500" :
                    "border-l-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                  }
                />
              ))
            ) : (
              <div className="flex flex-col justify-center flex-1 border-2 border-dashed border-border/50 rounded-xl bg-muted/5 p-8 items-center text-center opacity-40">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aguardando Fase Anterior...</span>
              </div>
            )}
          </div>
        </div>
    );
  };

  return (
    <div className="space-y-4 pb-20 min-h-screen bg-background">
      {/* MOBILE TABS */}
      <div className="md:hidden px-4 pt-4">
        <Tabs defaultValue="R32" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-muted/20 border border-white/5 h-12 p-1 gap-1">
                {phases.map(p => (
                    <TabsTrigger 
                        key={p.id} 
                        value={p.id}
                        className="flex-1 text-[9px] font-black uppercase tracking-tighter data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                        {p.name}
                    </TabsTrigger>
                ))}
            </TabsList>
            
            {phases.map(p => (
                <TabsContent key={p.id} value={p.id} className="mt-6">
                    {renderPhase(p.id, p.name, p.width, "mobile")}
                </TabsContent>
            ))}
        </Tabs>
      </div>

      {/* DESKTOP FULL BRACKET */}
      <div className="hidden md:flex overflow-x-auto min-w-full">
        <div className="flex gap-8 px-8 py-8 min-w-max">
            {phases.map((p) => renderPhase(p.id, p.name, p.width, "desktop"))}
        </div>
      </div>
    </div>
  );
}

function PhaseHeader({ name }: { name: string }) {
  return (
    <div className="text-center sticky top-0 bg-background/95 backdrop-blur-md z-10 py-2 md:py-3 border-b border-border/40 mb-2">
      <Badge variant="outline" className="px-4 md:px-6 py-1 md:py-1.5 uppercase tracking-widest font-black text-[9px] md:text-[10px] border-primary/30 text-primary bg-primary/10 shadow-sm">
        {name}
      </Badge>
    </div>
  );
}

function KnockoutMatchCard({ match, color }: { match: any, color: string }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, x: 5 }}
        onClick={() => (match.homeTeamId && match.awayTeamId) && setIsEditing(true)}
        className={cn(
            "relative group",
            (match.homeTeamId && match.awayTeamId) ? "cursor-pointer" : "cursor-not-allowed opacity-60"
        )}
      >
        <Card className={cn(
          "bg-card/40 border-l-4 border-y-border border-r-border hover:bg-card/80 transition-all overflow-hidden shadow-md group-hover:shadow-xl",
          color
        )}>
          <CardContent className="p-2 md:p-3 space-y-1.5 md:space-y-2">
            <div className="flex items-center justify-between text-[7px] md:text-[8px] font-bold text-muted-foreground uppercase tracking-tighter px-1 gap-2">
                <div className="flex items-center gap-1 shrink-0">
                    <Calendar size={8} />
                    {match.date}
                </div>
                
                {match.phase === "3rdPlace" && (
                  <span className="text-[6px] md:text-[8px] font-black px-1.5 py-0.5 rounded-sm bg-slate-500/20 text-slate-400 whitespace-nowrap">3º LUGAR</span>
                )}
                {match.phase === "Final" && (
                  <span className="text-[6px] md:text-[8px] font-black px-1.5 py-0.5 rounded-sm bg-yellow-500/20 text-yellow-500 whitespace-nowrap">GRANDE FINAL</span>
                )}

                <span className="truncate max-w-[60px] md:max-w-[80px] text-right">{match.city}</span>
            </div>

            <div className={cn(
                "flex items-center justify-between gap-2 md:gap-3 px-1.5 md:px-2 py-1.5 md:py-2 rounded bg-muted/30 transition-colors",
                match.winnerId === match.homeTeamId && "bg-primary/10 ring-1 ring-primary/30"
            )}>
              <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                {match.homeTeam ? (
                  <>
                    <img src={match.homeTeam.flag} className="w-5 h-3.5 md:w-6 md:h-4 rounded shadow-sm object-cover shrink-0" alt="" />
                    <span className={cn(
                        "text-[10px] md:text-xs font-black uppercase truncate w-20 md:w-24",
                        match.winnerId === match.homeTeamId ? "text-primary" : "text-foreground"
                    )}>{match.homeTeam.name}</span>
                  </>
                ) : (
                  <span className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase italic truncate">{match.homeTeamPlaceholder || "TBD"}</span>
                )}
              </div>
              <span className="text-xs md:text-sm font-black text-primary shrink-0">{match.homeGoals ?? "-"}</span>
            </div>
            
            <div className={cn(
                "flex items-center justify-between gap-2 md:gap-3 px-1.5 md:px-2 py-1.5 md:py-2 rounded bg-muted/30 transition-colors",
                match.winnerId === match.awayTeamId && "bg-primary/10 ring-1 ring-primary/30"
            )}>
               <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                {match.awayTeam ? (
                  <>
                    <img src={match.awayTeam.flag} className="w-5 h-3.5 md:w-6 md:h-4 rounded shadow-sm object-cover shrink-0" alt="" />
                    <span className={cn(
                        "text-[10px] md:text-xs font-black uppercase truncate w-20 md:w-24",
                        match.winnerId === match.awayTeamId ? "text-primary" : "text-foreground"
                    )}>{match.awayTeam.name}</span>
                  </>
                ) : (
                  <span className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase italic truncate">{match.awayTeamPlaceholder || "TBD"}</span>
                )}
              </div>
              <span className="text-xs md:text-sm font-black text-primary shrink-0">{match.awayGoals ?? "-"}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {isEditing && (
        <MatchEditDialog 
            match={match} 
            isOpen={isEditing} 
            onClose={() => setIsEditing(false)} 
        />
      )}
    </>
  );
}
