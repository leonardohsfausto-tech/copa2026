"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Loader2, Trophy, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function FavoritosPage() {
  const teams = useQuery(api.teams.list);
  const toggleFavorite = useMutation(api.teams.toggleFavorite);

  if (!teams) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const favoriteTeams = teams.filter((t: any) => t.isFavorite);

  return (
    <div className="space-y-10 pb-20 px-8 max-w-[1800px]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
            <Star className="text-primary w-8 h-8 fill-primary" />
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">MINHAS SELEÇÕES</h1>
        </div>
        <p className="text-muted-foreground ml-11 font-medium">Favorite as seleções que você quer acompanhar de perto nesta Copa.</p>
      </div>

      {favoriteTeams.length > 0 && (
        <div className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" /> 
                Acompanhando Agora
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteTeams.map((team: any) => (
                    <FavoriteTeamCard key={team._id} team={team} onToggle={() => toggleFavorite({ teamId: team._id })} />
                ))}
            </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted-foreground/30" /> 
            Todas as Seleções
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {teams.map((team: any) => (
                <button 
                    key={team._id} 
                    onClick={() => toggleFavorite({ teamId: team._id })}
                    className="text-left group focus:outline-none"
                >
                    <Card className={cn(
                        "bg-card/40 border-border/60 hover:border-primary/50 transition-all overflow-hidden relative",
                        team.isFavorite && "border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(59,130,246,0.05)]"
                    )}>
                        <div className="absolute top-2 right-2">
                            <Star size={14} className={cn(
                                "transition-all",
                                team.isFavorite ? "text-primary fill-primary" : "text-muted-foreground/20 group-hover:text-primary/40"
                            )} />
                        </div>
                        <CardContent className="p-4 flex flex-col items-center gap-3">
                            <img src={team.flag} className="w-10 h-6 rounded shadow-lg object-cover" alt="" />
                            <span className={cn(
                                "text-[11px] font-black uppercase text-center tracking-tight truncate w-full",
                                team.isFavorite ? "text-primary" : "text-foreground/80"
                            )}>{team.name}</span>
                        </CardContent>
                    </Card>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function FavoriteTeamCard({ team, onToggle }: { team: any, onToggle: () => void }) {
  return (
    <Card className="bg-card/60 border-primary/20 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4">
        <Button variant="ghost" size="icon" onClick={onToggle} className="hover:bg-primary/10">
            <Star className="text-primary fill-primary" size={20} />
        </Button>
      </div>
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center gap-6">
            <img src={team.flag} className="w-20 h-12 rounded-xl shadow-2xl object-cover ring-2 ring-primary/20" alt="" />
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Grupo {team.group}</span>
                <h3 className="text-2xl font-black italic uppercase">{team.name}</h3>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-border/40 pt-6">
            <StatItem label="PTS" value={team.points} color="text-primary" />
            <StatItem label="VIT" value={team.wins} />
            <StatItem label="SG" value={team.goalDifference} />
        </div>

        <div className="flex items-center justify-between pt-2">
             <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Próximo Jogo</span>
             </div>
             <Badge variant="outline" className="text-[9px] border-primary/20 text-primary">Ver Agenda</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value, color = "text-foreground" }: { label: string, value: any, color?: string }) {
    return (
        <div className="flex flex-col items-center p-2 rounded-xl bg-muted/20 border border-white/5">
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
            <span className={cn("text-lg font-black italic", color)}>{value}</span>
        </div>
    )
}
