"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, CalendarDays, Trophy, Database, AlertTriangle, Loader2, CheckCircle2, User } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
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

export function TopNav() {
  const pathname = usePathname();

  const tabs = [
    { icon: LayoutGrid, label: "Grupos", href: "/grupos" },
    { icon: CalendarDays, label: "Jogos", href: "/calendario" },
    { icon: Trophy, label: "Mata-Mata", href: "/mata-mata" },
  ];

  return (
    <div className="w-full bg-[#003d21] border-b border-white/5 pt-6 px-4 md:px-10 pb-4">
      {/* HEADER COMPACTO E CENTRALIZADO */}
      <div className="max-w-[1800px] mx-auto flex flex-col items-center text-center gap-4 mb-6">
        <div className="flex flex-col items-center">
            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-tight">
                COPA DO MUNDO <span className="text-[#eab308]">2026</span>
            </h1>
            <p className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mt-1">
                CANADÁ • MÉXICO • EUA
            </p>
        </div>
        
        <div className="md:absolute md:right-10 md:top-6 flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white border border-white/10 backdrop-blur-sm cursor-pointer text-[10px] font-black uppercase tracking-widest">
                  <User size={14} />
                  Login
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-3">
                <SeedButton />
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8 border border-white/20"
                    }
                  }}
                />
              </div>
            </SignedIn>
        </div>
      </div>

      {/* TABS AREA COMPACTA */}
      <div className="max-w-[1800px] mx-auto flex justify-center">
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl w-full max-w-xl border border-white/5 backdrop-blur-md">
            {tabs.map((tab) => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-300 font-black uppercase text-[10px] md:text-[11px] tracking-widest",
                        pathname === tab.href 
                            ? "bg-white text-[#003d21] shadow-lg scale-105 z-10" 
                            : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                >
                    <tab.icon size={14} />
                    <span>{tab.label}</span>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

function SeedButton() {
  const seed = useMutation(api.seed.seed);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [isOpen, setIsOpen] = useState(false);

  const handleSeed = async () => {
    setStatus("loading");
    try {
      await seed();
      setStatus("success");
      setIsOpen(false); // Fecha o modal imediatamente após o sucesso
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) {
      console.error("Erro ao executar seed:", e);
      setStatus("idle");
      alert("Erro ao inicializar dados. Verifique o console do Convex.");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 hover:bg-black/40 rounded-lg transition-all text-white/30 hover:text-white border border-white/5 backdrop-blur-sm cursor-pointer">
                {status === "loading" ? <Loader2 size={14} className="animate-spin" /> : status === "success" ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Database size={14} />}
                <span className="text-[9px] font-black uppercase tracking-widest">Inicializar</span>
            </div>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-card border-border shadow-2xl">
            <AlertDialogHeader className="flex flex-col items-center justify-center text-center sm:text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)] mx-auto">
                    <AlertTriangle className="text-red-500" size={32} />
                </div>
                <AlertDialogTitle className="font-black uppercase italic tracking-tighter text-2xl text-foreground text-center w-full">RESETAR SISTEMA?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground font-medium max-w-[280px] text-center mx-auto">
                    Todos os placares atuais serão perdidos e a competição voltará ao início. Deseja continuar?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row items-center justify-center gap-3 bg-transparent border-none p-0 sm:p-0 sm:bg-transparent sm:border-none">
                <AlertDialogCancel className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest border-border bg-white/5 hover:bg-white/10 h-11 m-0">CANCELAR</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={(e) => {
                        e.preventDefault();
                        handleSeed();
                    }}
                    className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest bg-red-600 hover:bg-red-700 text-white border-none h-11 shadow-[0_5px_15px_rgba(220,38,38,0.3)] m-0"
                >
                    SIM, RESETAR
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
