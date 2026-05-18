"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Activity, Play, Search, Bell, Shield, CheckCircle, XCircle, 
  Smartphone, Calendar, Clock, RefreshCw, Trophy, FileText, ChevronRight,
  Database, Edit3, Save, Ban, Check, Info, AlertTriangle
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Id } from "../../../convex/_generated/dataModel";

interface SerializableUser {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  createdAt: number;
  lastSignInAt: number | null;
}

interface AdminDashboardProps {
  totalClerkUsers: number;
  newUsersToday: number;
  users: SerializableUser[];
}

export default function AdminDashboard({ totalClerkUsers, newUsersToday, users = [] }: AdminDashboardProps) {
  const adminStats = useQuery(api.admin.getAdminStats);
  const adminUsersDetails = useQuery(api.admin.getAdminUsersDetails);
  const globalMatches = useQuery(api.admin.getGlobalMatches);
  const syncLogs = useQuery(api.admin.getSyncLogs, {});
  
  const triggerSync = useAction(api.realMatches.triggerManualSync);
  const updateGlobalScore = useMutation(api.admin.updateGlobalMatchScore);

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "matches" | "users" | "logs">("overview");

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [matchSearchTerm, setMatchSearchTerm] = useState("");
  const [matchPhaseFilter, setMatchPhaseFilter] = useState("all");

  // Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Manual Editing States (Fallback Panel)
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [matchStatus, setMatchStatus] = useState("agendado");
  const [isExtraTime, setIsExtraTime] = useState(false);
  const [isPenalties, setIsPenalties] = useState(false);
  const [winnerId, setWinnerId] = useState<string | undefined>(undefined);
  const [homeYellow, setHomeYellow] = useState(0);
  const [awayYellow, setAwayYellow] = useState(0);
  const [homeRed, setHomeRed] = useState(0);
  const [awayRed, setAwayRed] = useState(0);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [saveScoreMessage, setSaveScoreMessage] = useState<string | null>(null);

  // Trigger manual API fetch
  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      await triggerSync({});
      setSyncMessage("✅ Sincronização concluída com sucesso!");
    } catch (err) {
      setSyncMessage("❌ Erro ao sincronizar. Verifique a chave da API.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 6000);
    }
  };

  // Editing a global match (CMS Fallback)
  const startEditingMatch = (match: any) => {
    setEditingMatchId(match._id);
    setHomeGoals(match.homeGoals ?? 0);
    setAwayGoals(match.awayGoals ?? 0);
    setMatchStatus(match.status ?? "agendado");
    setIsExtraTime(match.isExtraTime ?? false);
    setIsPenalties(match.isPenalties ?? false);
    setWinnerId(match.winnerId);
    setHomeYellow(match.homeYellowCards ?? 0);
    setAwayYellow(match.awayYellowCards ?? 0);
    setHomeRed(match.homeRedCards ?? 0);
    setAwayRed(match.awayRedCards ?? 0);
    setSaveScoreMessage(null);
  };

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatchId) return;

    setIsSavingScore(true);
    setSaveScoreMessage(null);
    try {
      await updateGlobalScore({
        matchId: editingMatchId as Id<"matches">,
        homeGoals,
        awayGoals,
        status: matchStatus,
        isExtraTime,
        isPenalties,
        winnerId: winnerId ? (winnerId as Id<"teams">) : undefined,
        homeYellowCards: homeYellow,
        awayYellowCards: awayYellow,
        homeRedCards: homeRed,
        awayRedCards: awayRed,
      });
      setSaveScoreMessage("✅ Placar oficial atualizado com sucesso!");
      setTimeout(() => {
        setEditingMatchId(null);
        setSaveScoreMessage(null);
      }, 1500);
    } catch (err: any) {
      setSaveScoreMessage(`❌ Falha: ${err.message || "Erro desconhecido"}`);
    } finally {
      setIsSavingScore(false);
    }
  };

  const matchesByUser = adminUsersDetails?.matchesByUser || {};
  const subsByUser = adminUsersDetails?.subsByUser || {};

  // Formatar datas
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (timestamp: number | null) => {
    if (!timestamp) return "Nunca";
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Há ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays} dias`;
  };

  // Filtrar usuários por nome ou email
  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );
  });

  // Filtrar partidas da Copa
  const filteredMatches = globalMatches?.filter((m) => {
    const search = matchSearchTerm.toLowerCase();
    const matchesSearch = 
      (m.homeTeam?.name || "").toLowerCase().includes(search) ||
      (m.awayTeam?.name || "").toLowerCase().includes(search) ||
      (m.homeTeamPlaceholder || "").toLowerCase().includes(search) ||
      (m.awayTeamPlaceholder || "").toLowerCase().includes(search);
    
    if (matchPhaseFilter === "all") return matchesSearch;
    if (matchPhaseFilter === "group") return matchesSearch && m.phase === "Group";
    if (matchPhaseFilter === "knockout") return matchesSearch && m.phase !== "Group";
    return matchesSearch && m.phase === matchPhaseFilter;
  }) || [];

  // Calcular novos cadastros nos últimos 7 dias
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  const registrationsByDay = last7Days.map((day) => {
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    const count = users.filter((u) => {
      const uDate = new Date(u.createdAt);
      return uDate >= day && uDate <= dayEnd;
    }).length;
    
    return {
      label: day.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" }),
      count,
    };
  });

  const maxCount = Math.max(...registrationsByDay.map(r => r.count), 1);

  // Percentuais de engajamento
  const pushOptInPercent = totalClerkUsers > 0 
    ? ((adminStats?.totalPushSubscribers || 0) / totalClerkUsers * 100).toFixed(1) 
    : "0.0";
  
  const simulationCompletionPercent = adminStats?.activeSimulations && adminStats.activeSimulations > 0
    ? ((adminStats.completedSimulations || 0) / adminStats.activeSimulations * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Central */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-1.5 mb-1.5">
            <Shield className="w-3.5 h-3.5" /> Administração Master
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Central SaaS Admin</h1>
          <p className="text-zinc-400 text-xs mt-1 max-w-xl">
            Acompanhe o crescimento do simulador Copa 2026, modifique os resultados oficiais (CMS) e envie notificações push aos usuários ativos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/20"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Buscando API...' : 'Forçar Sync da API'}
          </button>

          <Link
            href="/admin/push"
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-950/20"
          >
            <Bell className="w-4 h-4" />
            Notificações Push
          </Link>
        </div>
      </div>

      {/* Grid de Cards de Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md text-white shadow-lg shadow-black/30 hover:border-blue-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white tracking-tight">{totalClerkUsers}</div>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wide">Cadastrados via Clerk</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md text-white shadow-lg shadow-black/30 hover:border-emerald-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Novos Hoje
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-400 tracking-tight">+{newUsersToday}</div>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wide">Nas últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md text-white shadow-lg shadow-black/30 hover:border-amber-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Simulações Ativas
            </CardTitle>
            <Activity className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white tracking-tight">
              {adminStats ? adminStats.activeSimulations : "..."}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wide">
              Contas com dados salvos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md text-white shadow-lg shadow-black/30 hover:border-indigo-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Finais Simuladas
            </CardTitle>
            <Trophy className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white tracking-tight">
              {adminStats ? adminStats.completedSimulations : "..."}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wide">
              Mata-matas finalizados
            </p>
          </CardContent>
        </Card>
      </div>

      {syncMessage && (
        <div className={`px-4 py-3.5 rounded-xl text-sm font-semibold border ${
          syncMessage.startsWith('✅')
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {syncMessage}
        </div>
      )}

      {/* Tabs Administrativas */}
      <div className="flex border-b border-zinc-800 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-3 px-4 font-black uppercase tracking-widest text-[10px] transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "overview" 
              ? "border-blue-500 text-white" 
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          📈 Visão Geral & SaaS
        </button>
        <button
          onClick={() => setActiveTab("matches")}
          className={`py-3 px-4 font-black uppercase tracking-widest text-[10px] transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "matches" 
              ? "border-blue-500 text-white" 
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          🏆 Tabela Oficial (CMS)
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`py-3 px-4 font-black uppercase tracking-widest text-[10px] transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "users" 
              ? "border-blue-500 text-white" 
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          👥 Usuários Registrados
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`py-3 px-4 font-black uppercase tracking-widest text-[10px] transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "logs" 
              ? "border-blue-500 text-white" 
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          🔌 Histórico de Sync
        </button>
      </div>

      {/* TAB 1: VISÃO GERAL & SAAS GROWTH */}
      {activeTab === "overview" && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Gráfico de Cadastro de Usuários */}
          <div className="md:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">Crescimento de Cadastros</h3>
              <p className="text-zinc-500 text-xs">Novas contas criadas nos últimos 7 dias.</p>
            </div>
            
            <div className="flex items-end justify-between gap-2 h-48 pt-6 px-4 bg-zinc-950/40 rounded-xl border border-zinc-800/40 mt-6">
              {registrationsByDay.map((day, idx) => {
                const heightPercent = (day.count / maxCount) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group">
                    <div className="relative flex flex-col items-center w-full">
                      {/* Tooltip */}
                      <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow shadow-blue-500/20 whitespace-nowrap z-10">
                        {day.count} {day.count === 1 ? "cadastro" : "cadastros"}
                      </span>
                      <div 
                        style={{ height: `${Math.max(heightPercent, 6)}%` }} 
                        className="w-6 sm:w-10 bg-gradient-to-t from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 rounded-t-md transition-all duration-500 shadow-md shadow-blue-900/10 cursor-pointer"
                      />
                    </div>
                    <span className="text-[9px] text-zinc-500 mt-2 font-black uppercase tracking-tight">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Análises e Engajamento */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">Taxas de Engajamento</h3>
              <p className="text-zinc-500 text-xs">Desempenho e adesão de usuários ativos.</p>
            </div>

            {/* Circular Opt-in Progress */}
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-blue-400" /> Web Push Opt-in</span>
                <span className="text-blue-400 font-black">{pushOptInPercent}%</span>
              </div>
              <div className="w-full bg-zinc-950 border border-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(parseFloat(pushOptInPercent), 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal">
                Total de <strong className="text-zinc-300">{adminStats?.totalPushSubscribers || 0}</strong> assinantes ativos de notificações push.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between text-xs font-bold border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 flex items-center gap-1.5"><Trophy className="w-4 h-4 text-amber-400" /> Simulações Finalizadas</span>
                <span className="text-amber-400 font-black">{simulationCompletionPercent}%</span>
              </div>
              <div className="w-full bg-zinc-950 border border-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(parseFloat(simulationCompletionPercent), 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal">
                Dos usuários que criaram simulações, <strong className="text-zinc-300">{adminStats?.completedSimulations || 0}</strong> decidiram os jogos até a finalíssima.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TABELA OFICIAL (CMS & FALLBACK MANUAL) */}
      {activeTab === "matches" && (
        <div className="space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 border-b border-zinc-800 pb-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  Mesa de Controle Oficial (CMS)
                </h2>
                <p className="text-zinc-400 text-xs mt-1">
                  Pesquise por partidas globais e corrija placares manualmente (exclusivo do Administrador Master).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Filtrar por país..."
                    value={matchSearchTerm}
                    onChange={(e) => setMatchSearchTerm(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <select
                  value={matchPhaseFilter}
                  onChange={(e) => setMatchPhaseFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer w-full sm:w-auto"
                >
                  <option value="all">Todas as Fases</option>
                  <option value="group">Fase de Grupos</option>
                  <option value="knockout">Mata-Mata</option>
                  <option value="R32">Dezesseis-avos (R32)</option>
                  <option value="R16">Oitavas de Final (R16)</option>
                  <option value="Quarter">Quartas de Final</option>
                  <option value="Semi">Semifinais</option>
                  <option value="Final">Grande Final</option>
                </select>
              </div>
            </div>

            {/* Painel do Editor de Placar Inline */}
            {editingMatchId && (
              <form onSubmit={handleSaveScore} className="mb-6 p-6 rounded-2xl bg-zinc-950/80 border border-blue-500/20 backdrop-blur-md shadow-xl animate-fade-in space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4" /> Modificar Placar Oficial da Copa
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingMatchId(null)}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <Ban className="w-5 h-5" />
                  </button>
                </div>

                {saveScoreMessage && (
                  <div className={`px-4 py-3 rounded-lg text-xs font-semibold border ${
                    saveScoreMessage.startsWith('✅') 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {saveScoreMessage}
                  </div>
                )}

                {/* Editor UI */}
                {(() => {
                  const match = globalMatches?.find(m => m._id === editingMatchId);
                  if (!match) return null;

                  return (
                    <div className="space-y-4">
                      {/* Flex placar */}
                      <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-4 bg-zinc-900/20 border border-zinc-800/40 rounded-xl">
                        {/* Time 1 */}
                        <div className="flex items-center gap-3 w-full md:w-5/12 justify-end">
                          <span className="font-black uppercase tracking-tighter text-white text-base text-right">
                            {match.homeTeam?.name || match.homeTeamPlaceholder || "TBD"}
                          </span>
                          {match.homeTeam?.flag ? (
                            <img src={match.homeTeam.flag} alt="" className="w-10 h-7 rounded border border-zinc-800 object-cover shadow shadow-black" />
                          ) : (
                            <div className="w-10 h-7 bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-zinc-500 rounded flex items-center justify-center">TBD</div>
                          )}
                          <input
                            type="number"
                            min="0"
                            value={homeGoals}
                            onChange={(e) => setHomeGoals(parseInt(e.target.value) || 0)}
                            className="w-14 bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-lg p-2 text-center text-lg font-black text-white"
                          />
                        </div>

                        <span className="text-zinc-600 font-bold text-lg select-none">x</span>

                        {/* Time 2 */}
                        <div className="flex items-center gap-3 w-full md:w-5/12 justify-start">
                          <input
                            type="number"
                            min="0"
                            value={awayGoals}
                            onChange={(e) => setAwayGoals(parseInt(e.target.value) || 0)}
                            className="w-14 bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-lg p-2 text-center text-lg font-black text-white"
                          />
                          {match.awayTeam?.flag ? (
                            <img src={match.awayTeam.flag} alt="" className="w-10 h-7 rounded border border-zinc-800 object-cover shadow shadow-black" />
                          ) : (
                            <div className="w-10 h-7 bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-zinc-500 rounded flex items-center justify-center">TBD</div>
                          )}
                          <span className="font-black uppercase tracking-tighter text-white text-base text-left">
                            {match.awayTeam?.name || match.awayTeamPlaceholder || "TBD"}
                          </span>
                        </div>
                      </div>

                      {/* Configurações Avançadas */}
                      <div className="grid gap-4 sm:grid-cols-3 bg-zinc-900/10 p-4 rounded-xl border border-zinc-800/40 text-xs">
                        {/* Status */}
                        <div>
                          <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[9px] mb-1.5">Status do Jogo</label>
                          <select
                            value={matchStatus}
                            onChange={(e) => setMatchStatus(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-lg p-2.5 text-white"
                          >
                            <option value="agendado">Agendado (Não Iniciado)</option>
                            <option value="ao vivo">Ao Vivo (Em Andamento)</option>
                            <option value="encerrado">Encerrado (Finalizado)</option>
                          </select>
                        </div>

                        {/* Acréscimos & Prorrogação */}
                        <div className="flex flex-col gap-2 justify-center">
                          <label className="flex items-center gap-2 text-zinc-300 font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isExtraTime}
                              onChange={(e) => setIsExtraTime(e.target.checked)}
                              className="rounded border-zinc-800 text-blue-600 focus:ring-blue-500 bg-zinc-950"
                            />
                            Prorrogação?
                          </label>
                          
                          <label className="flex items-center gap-2 text-zinc-300 font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isPenalties}
                              onChange={(e) => setIsPenalties(e.target.checked)}
                              className="rounded border-zinc-800 text-blue-600 focus:ring-blue-500 bg-zinc-950"
                            />
                            Pênaltis?
                          </label>
                        </div>

                        {/* Vencedor (Desempate Mata-Mata) */}
                        {match.phase !== "Group" && (
                          <div>
                            <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[9px] mb-1.5">Vencedor do Jogo (Se empate)</label>
                            <select
                              value={winnerId || ""}
                              onChange={(e) => setWinnerId(e.target.value || undefined)}
                              className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-lg p-2.5 text-white"
                            >
                              <option value="">Nenhum (Empate)</option>
                              {match.homeTeamId && (
                                <option value={match.homeTeamId}>{match.homeTeam?.name || "Time Mandante"}</option>
                              )}
                              {match.awayTeamId && (
                                <option value={match.awayTeamId}>{match.awayTeam?.name || "Time Visitante"}</option>
                              )}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingMatchId(null)}
                          className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Cancelar
                        </button>
                        
                        <button
                          type="submit"
                          disabled={isSavingScore}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          {isSavingScore ? "Salvando..." : "Salvar Placar Oficial"}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </form>
            )}

            {/* Lista de Partidas do CMS */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/60 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-4">Partida</th>
                    <th className="py-4 px-4 text-center">Placar</th>
                    <th className="py-4 px-4">Fase / Grupo</th>
                    <th className="py-4 px-4">Estádio / Cidade</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40 text-sm text-zinc-300">
                  {filteredMatches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-zinc-500">
                        Nenhuma partida encontrada para os termos inseridos.
                      </td>
                    </tr>
                  ) : (
                    filteredMatches.map((m) => (
                      <tr key={m._id} className="hover:bg-zinc-800/10 transition-all duration-150">
                        {/* Mandante vs Visitante */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              {m.homeTeam?.flag ? (
                                <img src={m.homeTeam.flag} alt="" className="w-5 h-3.5 rounded object-cover border border-zinc-800" />
                              ) : (
                                <span className="text-[10px] px-1 bg-zinc-800 rounded font-semibold text-zinc-500">TBD</span>
                              )}
                              <span className="font-bold text-white text-xs sm:text-sm">
                                {m.homeTeam?.name || m.homeTeamPlaceholder || "TBD"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {m.awayTeam?.flag ? (
                                <img src={m.awayTeam.flag} alt="" className="w-5 h-3.5 rounded object-cover border border-zinc-800" />
                              ) : (
                                <span className="text-[10px] px-1 bg-zinc-800 rounded font-semibold text-zinc-500">TBD</span>
                              )}
                              <span className="font-bold text-white text-xs sm:text-sm">
                                {m.awayTeam?.name || m.awayTeamPlaceholder || "TBD"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Placar Oficial */}
                        <td className="py-4 px-4 text-center">
                          {m.status !== "agendado" ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="font-black text-base text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-lg tracking-wide">
                                {m.homeGoals} - {m.awayGoals}
                              </span>
                              {m.isExtraTime && (
                                <span className="text-[8px] uppercase tracking-wide font-black text-amber-500 mt-1">PRORROG.</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-500 font-mono flex items-center justify-center gap-1">
                              <Clock className="w-3 h-3" /> {m.time}
                            </span>
                          )}
                        </td>

                        {/* Fase/Grupo */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-black text-[10px] uppercase text-zinc-400 tracking-wider">
                              {m.phase === "Group" ? `Grupo ${m.group}` : m.phase}
                            </span>
                            <span className="text-zinc-500 text-[10px] flex items-center gap-1.5 mt-0.5">
                              <Calendar className="w-3 h-3" /> {m.date}
                            </span>
                          </div>
                        </td>

                        {/* Estádio */}
                        <td className="py-4 px-4 text-zinc-400 text-xs">
                          <div className="flex flex-col leading-tight">
                            <span className="text-zinc-300 font-semibold">{m.stadium}</span>
                            <span className="text-zinc-500 text-[10px]">{m.city}, {m.country}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          {m.status === "encerrado" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              Encerrado
                            </span>
                          ) : m.status === "ao vivo" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
                              Ao Vivo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-400">
                              Agendado
                            </span>
                          )}
                        </td>

                        {/* Editar Placar */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => startEditingMatch(m)}
                            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors inline-flex items-center justify-center shadow shadow-blue-900/20"
                            title="Editar Placar Oficial"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GERENCIAMENTO DE USUÁRIOS */}
      {activeTab === "users" && (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-zinc-800 pb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Usuários Cadastrados
              </h2>
              <p className="text-zinc-400 text-xs mt-1">
                Lista de usuários cadastrados via Clerk, exibindo status de simulações ativas e autorizações do Push.
              </p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar usuário ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/60 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4">Usuário</th>
                  <th className="py-4 px-4">Cadastro</th>
                  <th className="py-4 px-4">Último Acesso</th>
                  <th className="py-4 px-4 text-center">Status Simulação</th>
                  <th className="py-4 px-4 text-center">Notificação Push</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 text-sm text-zinc-300">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-zinc-500">
                      Nenhum usuário correspondente encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const simulatedCount = matchesByUser[u.id] || 0;
                    const isSubscribed = subsByUser[u.id] || false;

                    return (
                      <tr key={u.id} className="hover:bg-zinc-800/10 transition-all duration-150">
                        {/* Perfil */}
                        <td className="py-4 px-4 flex items-center gap-3">
                          <img
                            src={u.imageUrl}
                            alt={u.name}
                            className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80";
                            }}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-white hover:text-blue-400 transition-colors">
                              {u.name}
                            </span>
                            <span className="text-zinc-500 text-xs font-mono">
                              {u.email}
                            </span>
                          </div>
                        </td>

                        {/* Cadastro */}
                        <td className="py-4 px-4 text-zinc-400">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            {formatDate(u.createdAt)}
                          </div>
                        </td>

                        {/* Último Login */}
                        <td className="py-4 px-4 text-zinc-400">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            {formatTimeAgo(u.lastSignInAt)}
                          </div>
                        </td>

                        {/* Status Simulação */}
                        <td className="py-4 px-4 text-center">
                          {simulatedCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Simulando ({simulatedCount})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 border border-zinc-700 text-zinc-400">
                              <XCircle className="w-3.5 h-3.5" />
                              Apenas Cadastro
                            </span>
                          )}
                        </td>

                        {/* Notificação Push */}
                        <td className="py-4 px-4 text-center">
                          {isSubscribed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                              <Smartphone className="w-3.5 h-3.5" />
                              Habilitado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                              <Smartphone className="w-3.5 h-3.5 opacity-60" />
                              Desativado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: HISTÓRICO DE SYNCS */}
      {activeTab === "logs" && (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Database className="w-5 h-5 text-blue-500" />
              Histórico de Sincronizações
            </h2>
            <p className="text-zinc-400 text-xs mb-6 pb-4 border-b border-zinc-800">
              Auditorias de execuções automatizadas e acionamentos manuais da API de resultados esportivos externos.
            </p>
          </div>

          <div className="space-y-4">
            {syncLogs && syncLogs.length > 0 ? (
              syncLogs.map((log) => (
                <div 
                  key={log._id} 
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs backdrop-blur-md transition-all ${
                    log.status === "sucesso" 
                      ? 'bg-emerald-500/5 border-emerald-500/10 text-zinc-300 hover:border-emerald-500/20' 
                      : 'bg-red-500/5 border-red-500/10 text-zinc-300 hover:border-red-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {log.status === "sucesso" ? (
                      <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <p className="font-bold text-white">{log.message}</p>
                      {log.matchesSynced !== undefined && (
                        <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">
                          Partidas Processadas: <span className="font-black text-zinc-300">{log.matchesSynced}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-zinc-500 shrink-0 select-none">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(log.timestamp)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-zinc-500 text-xs">
                Nenhum log de sincronização registrado até o momento. Execute a sincronização manual acima para gerar o primeiro registro.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
