"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Loader2, PlayCircle, Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SimuladorPage() {
  const allTeams = useQuery(api.teams.list, {});
  const allMatches = useQuery(api.matches.list, { phase: "Group" });

  if (!allTeams || !allMatches) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const finishedMatches = allMatches.filter(m => m.status === "encerrado").length;
  const progress = (finishedMatches / allMatches.length) * 100;

  return (
    <div className="space-y-10 pb-20 px-8 max-w-[1800px]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
            <LayoutDashboard className="text-primary w-8 h-8" />
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">SIMULADOR COPA 2026</h1>
        </div>
        <p className="text-muted-foreground ml-11 font-medium">Gerencie suas previsões e veja o caminho para a grande final.</p>
      </div>

      {/* DASHBOARD DE PROGRESSO */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-card/40 border-border/60 shadow-xl backdrop-blur-md overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <TrendingUp size={60} />
            </div>
            <CardContent className="p-6 space-y-4">
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Progresso da Simulação</div>
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <span className="text-4xl font-black italic">{progress.toFixed(0)}%</span>
                        <span className="text-[10px] font-bold text-muted-foreground">{finishedMatches} / {allMatches.length} JOGOS</span>
                    </div>
                    <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/60 shadow-xl backdrop-blur-md overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <Trophy size={60} />
            </div>
            <CardContent className="p-6 space-y-4">
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status do Mata-Mata</div>
                <div className="space-y-4">
                    {progress === 100 ? (
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 font-black">LIBERADO</Badge>
                    ) : (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black">BLOQUEADO</Badge>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Complete todos os jogos da fase de grupos para habilitar o chaveamento automático.
                    </p>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/60 shadow-xl backdrop-blur-md overflow-hidden relative group">
             <CardContent className="p-0 flex flex-col h-full">
                <Link href="/grupos" className="flex-1 p-6 hover:bg-primary/5 transition-colors border-b border-border/50 flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                        <span className="font-black uppercase italic tracking-tight">Ir para Grupos</span>
                        <PlayCircle className="text-primary" />
                    </div>
                </Link>
                <Link href="/mata-mata" className="flex-1 p-6 hover:bg-primary/5 transition-colors flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                        <span className="font-black uppercase italic tracking-tight">Ver Chaveamento</span>
                        <Trophy className="text-primary opacity-50" />
                    </div>
                </Link>
             </CardContent>
        </Card>
      </div>

      {/* QUICK VIEW GRUPOS */}
      <div className="space-y-6">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" /> 
            Visão Geral dos Grupos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map((g) => (
                <Link key={g} href={`/grupos`}>
                    <Card className="bg-card/40 border-border/60 hover:border-primary/50 transition-all cursor-pointer group">
                        <CardContent className="p-4 flex flex-col items-center gap-2">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Grupo</span>
                            <span className="text-3xl font-black italic group-hover:text-primary transition-colors">{g}</span>
                            <div className="flex -space-x-2 mt-2">
                                {allTeams.filter(t => t.group === g).map(t => (
                                    <img key={t._id} src={t.flag} className="w-6 h-4 rounded-sm border border-black shadow-sm" alt="" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
