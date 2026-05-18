"use client";

import { useUser } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bell, Send, User } from "lucide-react";

export default function AdminPushPage() {
  const { user, isLoaded } = useUser();
  const sendNotification = useAction(api.pushActions.sendNotificationToAll);
  const sendTestNotification = useAction(api.pushActions.sendNotificationToUser);
  
  const [title, setTitle] = useState("A Copa começou!");
  const [body, setBody] = useState("Atualize suas simulações com os últimos resultados.");
  const [url, setUrl] = useState("/");
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isLoaded) return <div className="p-10 text-white flex justify-center">Carregando...</div>;

  const email = user?.primaryEmailAddress?.emailAddress;
  if (email !== "leonardohs.fausto@gmail.com") {
    redirect("/");
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await sendNotification({ title, body, url });
      if (res && res.success === false) {
        setResult({ 
          success: false, 
          error: res.error, 
          message: res.message 
        });
      } else {
        setResult({ success: true, isTest: false, data: res });
      }
    } catch (err: any) {
      setResult({ success: false, error: "UNKNOWN_ERROR", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    setTestLoading(true);
    setResult(null);
    try {
      const res = await sendTestNotification({ 
        userId: user.id, 
        title: `[TESTE] ${title}`, 
        body, 
        url 
      });
      if (res && res.success === false) {
        setResult({ 
          success: false, 
          error: res.error, 
          message: res.message 
        });
      } else {
        setResult({ success: true, isTest: true, data: res });
      }
    } catch (err: any) {
      setResult({ success: false, error: "UNKNOWN_ERROR", message: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-4 md:mt-10 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl space-y-6">
      {/* Botão de Voltar para o Painel */}
      <Link 
        href="/admin"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors group select-none cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Voltar para o Painel
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
          <Bell className="w-6 h-6 text-blue-500 animate-pulse" />
          Painel Admin - Notificações Push
        </h1>
        <p className="text-zinc-400 text-xs">Somente leonardohs.fausto@gmail.com pode acessar esta área.</p>
      </div>
      
      <form onSubmit={handleSend} className="space-y-5">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-1.5">Título da Notificação</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-lg p-3 text-white outline-none transition-all text-sm font-semibold"
            required
            placeholder="Ex: Novo Jogo Adicionado!"
          />
        </div>
        
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-1.5">Mensagem</label>
          <textarea 
            value={body} 
            onChange={e => setBody(e.target.value)} 
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-lg p-3 text-white h-24 outline-none transition-all resize-none text-sm font-semibold leading-normal"
            required
            placeholder="Ex: O Brasil joga hoje às 16h, não esqueça de palpitar!"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-1.5">URL de Destino ao Clicar</label>
          <input 
            type="text" 
            value={url} 
            onChange={e => setUrl(e.target.value)} 
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-lg p-3 text-white outline-none transition-all text-sm font-mono"
            placeholder="Ex: /estatisticas ou /"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            type="button"
            onClick={handleSendTest}
            disabled={loading || testLoading}
            className="flex-1 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/80 text-white font-bold text-xs uppercase tracking-widest py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-black/20"
          >
            <User className="w-4 h-4 text-zinc-400" />
            {testLoading ? "Enviando Teste..." : "Teste (Apenas p/ Mim)"}
          </button>

          <button 
            type="submit" 
            disabled={loading || testLoading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20"
          >
            <Send className="w-4 h-4" />
            {loading ? "Enviando Todos..." : "Enviar p/ Todos"}
          </button>
        </div>
      </form>

      {result && (
        <div className={`p-5 rounded-xl border flex flex-col gap-3 backdrop-blur-md transition-all ${
          result.success 
            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/5 border-red-500/20 text-red-400"
        }`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="p-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            
            <div>
              <p className="font-bold text-white text-sm">
                {result.success 
                  ? (result.isTest ? "Notificação de teste disparada!" : "Notificações gerais entregues!")
                  : "Falha no envio da notificação"
                }
              </p>
              
              {result.success ? (
                <div className="text-xs text-zinc-300 mt-2 space-y-1">
                  <p>Inscrições ativas notificadas com sucesso: <strong className="text-white font-black text-sm">{result.data?.successCount}</strong></p>
                  {!result.isTest && (
                    <p>Inscrições limpas (tokens inválidos): <strong className="text-white font-black text-sm">{result.data?.failCount}</strong></p>
                  )}
                  {result.isTest && result.data?.successCount === 0 && (
                    <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-[10px] font-semibold leading-normal">
                      ⚠️ DICA IMPORTANTE: Você não recebeu o teste porque seu navegador atual ainda não se inscreveu nas notificações! Vá para a página inicial e ative as notificações no botão correspondente para habilitar seu dispositivo.
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 mt-1 leading-normal">
                  Erro: {result.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
