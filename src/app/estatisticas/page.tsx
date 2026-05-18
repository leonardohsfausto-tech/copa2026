"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loader2, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EstatisticasPage() {
  const stats = useQuery(api.realMatches.getGlobalStats);

  if (stats === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8 pb-20 px-4 md:px-8 max-w-[1800px] mx-auto pt-6 md:pt-8 fade-in zoom-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Artilharia */}
        <StatCard
          title="Artilharia"
          icon={<Award className="text-emerald-400" size={24} />}
          data={stats.topScorers}
          metricLabel="Gols"
          accentColor="emerald"
        />

        {/* Assistências */}
        <StatCard
          title="Assistências"
          icon={<TrendingUp className="text-blue-400" size={24} />}
          data={stats.topAssists}
          metricLabel="Assistências"
          accentColor="blue"
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  icon,
  data,
  metricLabel,
  accentColor,
}: {
  title: string;
  icon: React.ReactNode;
  data: any[];
  metricLabel: string;
  accentColor: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "border-emerald-500/20 bg-emerald-500/5",
    blue: "border-blue-500/20 bg-blue-500/5",
  };

  const textMap: Record<string, string> = {
    emerald: "text-emerald-400",
    blue: "text-blue-400",
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-white/5 p-6 rounded-2xl shadow-xl flex flex-col h-[480px]">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <div className={cn("p-2 rounded-lg", colorMap[accentColor])}>
          {icon}
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter">{title}</h3>
      </div>

      {/* Cabeçalho das colunas */}
      <div className="flex items-center justify-between px-3 mb-2">
        <div className="flex items-center gap-4">
          <span className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/50 w-6 text-center">#</span>
          <span className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/50">Jogador / Seleção</span>
        </div>
        <span className={cn("font-bold text-[10px] uppercase tracking-widest", textMap[accentColor])}>
          {metricLabel}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
            <span className="text-sm font-bold uppercase tracking-widest">Nenhum dado registrado</span>
          </div>
        ) : (
          data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "font-black text-lg w-6 text-center",
                    index === 0 ? textMap[accentColor] : "text-muted-foreground/50"
                  )}
                >
                  {index + 1}
                </span>
                <div className="flex items-center gap-3">
                  {item.team && (
                    <img
                      src={item.team.flag}
                      alt={item.team.name}
                      className="w-8 h-6 rounded object-cover shadow-sm"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="font-bold text-sm leading-tight group-hover:text-white transition-colors">
                      {item.playerName}
                    </span>
                    {item.team && (
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        {item.team.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={cn("font-black text-xl leading-none", textMap[accentColor])}>
                  {item.count}
                </span>
                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mt-1">
                  {metricLabel}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
