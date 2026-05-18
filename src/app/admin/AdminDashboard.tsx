"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Play, Search, Bell, Shield, CheckCircle, XCircle, Smartphone, Calendar, Clock, RefreshCw } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

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
  const triggerSync = useAction(api.realMatches.triggerManualSync);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

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

  return (
    <div className="space-y-8">
      {/* Grid de Cards de Estatísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md text-white shadow-lg shadow-black/30 hover:border-blue-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white tracking-tight">{totalClerkUsers}</div>
            <p className="text-xs text-zinc-500 mt-1">Registrados no Clerk</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md text-white shadow-lg shadow-black/30 hover:border-emerald-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Novos Hoje
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">+{newUsersToday}</div>
            <p className="text-xs text-zinc-500 mt-1">Nas últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md text-white shadow-lg shadow-black/30 hover:border-amber-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Simulações Ativas
            </CardTitle>
            <Activity className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {adminStats ? adminStats.activeSimulations : "..."}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Usuários com dados salvos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md text-white shadow-lg shadow-black/30 hover:border-indigo-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Partidas Simuladas
            </CardTitle>
            <Play className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {adminStats ? adminStats.totalMatchesSimulated : "..."}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Total de palpites/jogos salvos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção Principal de Usuários e Ações */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-zinc-800 pb-5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Usuários Cadastrados
            </h2>
            <p className="text-zinc-400 text-xs mt-1">
              Lista detalhada com engajamento, simulações e push habilitados.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Barra de Busca */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar usuário ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Ações Rápidas */}
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/20"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar API'}
            </button>

            <Link
              href="/admin/push"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/20"
            >
              <Bell className="w-4 h-4" />
              Notificações Push
            </Link>
          </div>
        </div>

        {/* Feedback de sincronização */}
        {syncMessage && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-semibold border ${
            syncMessage.startsWith('✅')
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {syncMessage}
          </div>
        )}

        {/* Tabela de Usuários */}
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
                    Nenhum usuário cadastrado ou encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const simulatedCount = matchesByUser[u.id] || 0;
                  const isSubscribed = subsByUser[u.id] || false;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-zinc-800/20 transition-all duration-150"
                    >
                      {/* Perfil e Detalhes */}
                      <td className="py-4 px-4 flex items-center gap-3">
                        <img
                          src={u.imageUrl}
                          alt={u.name}
                          className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800 object-cover"
                          onError={(e) => {
                            // Fallback caso a imagem dê erro
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

                      {/* Data de Cadastro */}
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
    </div>
  );
}
