"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  Users, 
  CalendarDays,
  Database,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: Users, label: "Fase de Grupos", href: "/grupos" },
  { icon: Trophy, label: "Mata-Mata", href: "/mata-mata" },
  { icon: CalendarDays, label: "Calendário", href: "/calendario" },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("w-64 border-r border-border bg-card flex flex-col z-20 shadow-2xl", className)}>
      <div className="p-8">
        <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent italic tracking-tighter">
          COPA 2026
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300",
              pathname === item.href 
                ? "bg-primary/20 text-primary border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <item.icon size={20} className={cn(pathname === item.href ? "text-primary" : "text-muted-foreground/50")} />
            <span className="font-bold tracking-tight text-xs uppercase">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-border/50">
        <SeedButton />
      </div>
    </aside>
  );
}

function SeedButton() {
  const seed = useMutation(api.simulations.initialize);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSeed = async () => {
    setStatus("loading");
    try {
      await seed();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) {
      setStatus("idle");
    }
  };

  return (
    <div className="space-y-4">
        <AlertDialog>
            <AlertDialogTrigger>
                <button className="flex items-center gap-3 px-3 py-3 w-full text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-all font-bold text-[10px] uppercase tracking-[0.2em]">
                    <Database size={18} className="text-muted-foreground/50" />
                    <span>Inicializar Dados</span>
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border shadow-2xl">
                <AlertDialogHeader>
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                        <AlertTriangle className="text-red-500" size={24} />
                    </div>
                    <AlertDialogTitle className="font-black uppercase italic tracking-tighter">VOCÊ TEM CERTEZA?</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground font-medium">
                        Esta ação é irreversível. Ao inicializar os dados, <span className="text-red-500 font-bold">todos os placares e classificações atuais serão deletados</span> e o banco retornará ao estado original.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                    <AlertDialogCancel className="rounded-xl font-black uppercase text-[10px] tracking-widest border-border bg-muted/20">CANCELAR</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleSeed}
                        className="rounded-xl font-black uppercase text-[10px] tracking-widest bg-red-600 hover:bg-red-700 text-white border-none"
                    >
                        {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : "SIM, RESETAR TUDO"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {status === "success" && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-in fade-in zoom-in duration-300">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Dados Resetados com Sucesso!</span>
            </div>
        )}
    </div>
  );
}
