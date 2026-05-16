"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MatchEditDialogProps {
  match: any;
  isOpen: boolean;
  onClose: () => void;
}

export function MatchEditDialog({ match, isOpen, onClose }: MatchEditDialogProps) {
  const [homeGoals, setHomeGoals] = useState(match.homeGoals?.toString() || "0");
  const [awayGoals, setAwayGoals] = useState(match.awayGoals?.toString() || "0");
  const [homeYellow, setHomeYellow] = useState(match.homeYellowCards?.toString() || "0");
  const [awayYellow, setAwayYellow] = useState(match.awayYellowCards?.toString() || "0");
  const [homeRed, setHomeRed] = useState(match.homeRedCards?.toString() || "0");
  const [awayRed, setAwayRed] = useState(match.awayRedCards?.toString() || "0");
  const [winnerId, setWinnerId] = useState<Id<"teams"> | undefined>(match.winnerId);
  const updateScore = useMutation(api.matches.updateScore);
  const handleSave = async () => {
    const h = parseInt(homeGoals || "0");
    const a = parseInt(awayGoals || "0");
    let finalWinnerId = winnerId;
    
    if (match.phase !== "Group") {
        if (h > a) finalWinnerId = match.homeTeamId;
        else if (a > h) finalWinnerId = match.awayTeamId;
    }

    if (match.phase !== "Group" && h === a && !finalWinnerId) {
        alert("Em caso de empate no mata-mata, você deve selecionar o vencedor nos pênaltis.");
        return;
    }

    await updateScore({
      matchId: match._id,
      homeGoals: h,
      awayGoals: a,
      homeYellowCards: parseInt(homeYellow || "0"),
      awayYellowCards: parseInt(awayYellow || "0"),
      homeRedCards: parseInt(homeRed || "0"),
      awayRedCards: parseInt(awayRed || "0"),
      status: "encerrado",
      winnerId: finalWinnerId,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-center font-black">ATUALIZAR PLACAR</DialogTitle>
          <div className="text-center text-[10px] uppercase font-bold text-muted-foreground mt-2">
            {match.stadium} • {match.city} • {match.date} às {match.time}
          </div>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            <div className="flex-1 flex flex-col items-center gap-6 min-w-0">
              <div className="flex flex-col items-center gap-2">
                {match.homeTeam && <img src={match.homeTeam.flag} className="w-20 h-12 rounded-md shadow-lg object-cover border border-white/10" alt="" />}
                <Label className="font-black text-[10px] md:text-xs uppercase text-center leading-none tracking-tight">{match.homeTeam?.name || match.homeTeamPlaceholder}</Label>
              </div>
              
              <div className="w-full space-y-4">
                <Input 
                    type="text" 
                    inputMode="numeric"
                    value={homeGoals}
                    onChange={(e) => setHomeGoals(e.target.value.replace(/\D/g, ""))}
                    onFocus={(e) => e.target.select()}
                    className="text-center text-4xl font-black h-20 bg-muted/30 border-none ring-1 ring-white/5 focus-visible:ring-primary/50 transition-all w-full shadow-inner"
                />
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center gap-1.5">
                        <Label className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Amarelo</Label>
                        <Input value={homeYellow} onChange={e => setHomeYellow(e.target.value.replace(/\D/g,""))} onFocus={e => e.target.select()} className="h-10 text-center text-xs font-black bg-muted/20 border-none ring-1 ring-white/5 w-full" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                        <Label className="text-[7px] font-black text-red-500 uppercase tracking-widest">Vermelho</Label>
                        <Input value={homeRed} onChange={e => setHomeRed(e.target.value.replace(/\D/g,""))} onFocus={e => e.target.select()} className="h-10 text-center text-xs font-black bg-muted/20 border-none ring-1 ring-white/5 w-full" />
                    </div>
                </div>
              </div>
            </div>

            <div className="text-xl font-black text-muted-foreground/20 self-center mt-[10px] italic">VS</div>

            <div className="flex-1 flex flex-col items-center gap-6 min-w-0">
              <div className="flex flex-col items-center gap-2">
                {match.awayTeam && <img src={match.awayTeam.flag} className="w-20 h-12 rounded-md shadow-lg object-cover border border-white/10" alt="" />}
                <Label className="font-black text-[10px] md:text-xs uppercase text-center leading-none tracking-tight">{match.awayTeam?.name || match.awayTeamPlaceholder}</Label>
              </div>

              <div className="w-full space-y-4">
                <Input 
                    type="text" 
                    inputMode="numeric"
                    value={awayGoals}
                    onChange={(e) => setAwayGoals(e.target.value.replace(/\D/g, ""))}
                    onFocus={(e) => e.target.select()}
                    className="text-center text-4xl font-black h-20 bg-muted/30 border-none ring-1 ring-white/5 focus-visible:ring-primary/50 transition-all w-full shadow-inner"
                />

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center gap-1.5">
                        <Label className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Amarelo</Label>
                        <Input value={awayYellow} onChange={e => setAwayYellow(e.target.value.replace(/\D/g,""))} onFocus={e => e.target.select()} className="h-10 text-center text-xs font-black bg-muted/20 border-none ring-1 ring-white/5 w-full" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                        <Label className="text-[7px] font-black text-red-500 uppercase tracking-widest">Vermelho</Label>
                        <Input value={awayRed} onChange={e => setAwayRed(e.target.value.replace(/\D/g,""))} onFocus={e => e.target.select()} className="h-10 text-center text-xs font-black bg-muted/20 border-none ring-1 ring-white/5 w-full" />
                    </div>
                </div>
              </div>
            </div>
          </div>

          {match.phase !== "Group" && homeGoals === awayGoals && (
            <div className="space-y-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Label className="text-[10px] font-black uppercase text-amber-500 block text-center">Empate no mata-mata: Quem vence nos pênaltis?</Label>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className={cn("flex-1 text-[10px] font-black uppercase", winnerId === match.homeTeamId && "bg-amber-500 text-black border-amber-500")}
                        onClick={() => setWinnerId(match.homeTeamId)}
                    >
                        {match.homeTeam?.name}
                    </Button>
                    <Button 
                        variant="outline"
                        className={cn("flex-1 text-[10px] font-black uppercase", winnerId === match.awayTeamId && "bg-amber-500 text-black border-amber-500")}
                        onClick={() => setWinnerId(match.awayTeamId)}
                    >
                        {match.awayTeam?.name}
                    </Button>
                </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 font-bold py-6 text-white uppercase tracking-widest">
            SALVAR RESULTADO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
