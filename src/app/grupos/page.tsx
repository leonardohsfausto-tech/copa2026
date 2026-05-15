"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function GruposPage() {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const activeGroup = GROUPS[activeGroupIndex];
  
  const teams = useQuery(api.teams.getByGroup, { group: activeGroup });
  const bestThirds = useQuery(api.teams.getBestThirds, {}) || [];
  const qualifiedThirdsIds = new Set(bestThirds.slice(0, 8).map(t => t._id));

  const nextGroup = () => setActiveGroupIndex((prev) => (prev + 1) % GROUPS.length);
  const prevGroup = () => setActiveGroupIndex((prev) => (prev - 1 + GROUPS.length) % GROUPS.length);

  if (!teams) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8 pb-20 px-4 md:px-8 max-w-[1800px]">

      {/* SELETOR DE GRUPO COM SETAS */}
      <div className="flex items-center justify-center gap-6 py-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={prevGroup}
          className="rounded-full border-white/5 bg-white/5 hover:bg-primary/10 hover:border-primary/50 text-muted-foreground hover:text-primary w-10 h-10 transition-all"
        >
          <ChevronLeft size={20} />
        </Button>
        
        <div className="flex flex-col items-center">
            <div className="text-xl md:text-3xl font-black italic bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent px-2 md:px-6">
                GRUPO {activeGroup}
            </div>
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={nextGroup}
          className="rounded-full border-white/5 bg-white/5 hover:bg-primary/10 hover:border-primary/50 text-muted-foreground hover:text-primary w-10 h-10 transition-all"
        >
          <ChevronRight size={20} />
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> 
                TABELA DE PONTUAÇÃO COMPLETA
            </h2>
        </div>

        <Card className="bg-card/40 border-border/60 overflow-hidden shadow-2xl backdrop-blur-md">
        <CardContent className="p-0">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                <tr className="text-[9px] md:text-[10px] uppercase font-black text-muted-foreground/60 border-b border-border/30 bg-muted/20">
                    <th className="px-4 md:px-8 py-4 md:py-5 text-left">Seleção</th>
                    <th className="px-2 md:px-4 py-4 md:py-5 text-center">Pts</th>
                    <th className="px-2 md:px-4 py-4 md:py-5 text-center">J</th>
                    <th className="px-2 md:px-4 py-4 md:py-5 text-center">V</th>
                    <th className="hidden sm:table-cell px-2 md:px-4 py-4 md:py-5 text-center">E</th>
                    <th className="hidden sm:table-cell px-2 md:px-4 py-4 md:py-5 text-center">D</th>
                    <th className="hidden md:table-cell px-2 md:px-4 py-4 md:py-5 text-center">GP</th>
                    <th className="hidden md:table-cell px-2 md:px-4 py-4 md:py-5 text-center">GC</th>
                    <th className="px-2 md:px-4 py-4 md:py-5 text-center">SG</th>
                </tr>
                </thead>
                <tbody>
                {teams.map((team: any, i: number) => (
                    <tr key={team._id} className="border-b border-border/10 last:border-0 group hover:bg-primary/5 transition-all">
                    <td className="px-4 md:px-8 py-4 md:py-6 flex items-center gap-2 md:gap-6">
                        <span className={cn(
                        "w-6 h-6 md:w-8 md:h-8 rounded md:rounded-lg flex items-center justify-center text-[10px] md:text-xs font-black shrink-0",
                        i < 2 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : 
                        (i === 2 && qualifiedThirdsIds.has(team._id)) ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]" :
                        "bg-muted/50 text-muted-foreground"
                        )}>{i + 1}</span>
                        <img src={team.flag} className="w-8 h-5 md:w-10 md:h-6 rounded shadow-md object-cover ring-1 ring-white/10 shrink-0" alt="" />
                        <span className="font-black text-foreground/90 tracking-tight text-xs md:text-base truncate max-w-[80px] md:max-w-none">{team.name}</span>
                    </td>
                    <td className="px-2 md:px-4 py-4 md:py-6 text-center font-black text-primary text-base md:text-xl">{team.points}</td>
                    <td className="px-2 md:px-4 py-4 md:py-6 text-center font-bold text-foreground/70 text-xs md:text-sm">{team.played || 0}</td>
                    <td className="px-2 md:px-4 py-4 md:py-6 text-center font-bold text-foreground/70 text-xs md:text-sm">{team.wins || 0}</td>
                    <td className="hidden sm:table-cell px-2 md:px-4 py-4 md:py-6 text-center font-bold text-foreground/70 text-xs md:text-sm">{team.draws || 0}</td>
                    <td className="hidden sm:table-cell px-2 md:px-4 py-4 md:py-6 text-center font-bold text-foreground/70 text-xs md:text-sm">{team.losses || 0}</td>
                    <td className="hidden md:table-cell px-2 md:px-4 py-4 md:py-6 text-center font-bold text-foreground/70 text-xs md:text-sm">{team.goalsScored}</td>
                    <td className="hidden md:table-cell px-2 md:px-4 py-4 md:py-6 text-center font-bold text-foreground/70 text-xs md:text-sm">{team.goalsAgainst}</td>
                    <td className={cn(
                        "px-2 md:px-4 py-4 md:py-6 text-center font-black text-sm md:text-lg",
                        team.goalDifference > 0 ? "text-emerald-500" : team.goalDifference < 0 ? "text-red-500" : "text-muted-foreground"
                    )}>{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
