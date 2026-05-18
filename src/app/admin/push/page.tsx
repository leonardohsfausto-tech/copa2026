"use client";

import { useUser } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { redirect } from "next/navigation";

export default function AdminPushPage() {
  const { user, isLoaded } = useUser();
  const sendNotification = useAction(api.pushActions.sendNotificationToAll);
  
  const [title, setTitle] = useState("A Copa começou!");
  const [body, setBody] = useState("Atualize suas simulações com os últimos resultados.");
  const [url, setUrl] = useState("/");
  const [loading, setLoading] = useState(false);
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
        setResult({ success: true, data: res });
      }
    } catch (err: any) {
      setResult({ success: false, error: "UNKNOWN_ERROR", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-4 md:mt-10 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">Painel Admin - Notificações Push</h1>
      <p className="text-zinc-400 mb-6 text-sm">Somente leonardohs.fausto@gmail.com pode acessar esta área.</p>
      
      <form onSubmit={handleSend} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Título da Notificação</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg p-3 text-white outline-none transition-all"
            required
            placeholder="Ex: Novo Jogo Adicionado!"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Mensagem</label>
          <textarea 
            value={body} 
            onChange={e => setBody(e.target.value)} 
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg p-3 text-white h-28 outline-none transition-all resize-none"
            required
            placeholder="Ex: O Brasil joga hoje às 16h, não esqueça de palpitar!"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">URL de Destino ao Clicar</label>
          <input 
            type="text" 
            value={url} 
            onChange={e => setUrl(e.target.value)} 
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg p-3 text-white outline-none transition-all"
            placeholder="Ex: /estatisticas ou /"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Enviar Notificação para Todos
            </>
          )}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-5 rounded-lg flex flex-col gap-3 border ${result.success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <>
                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-bold text-white text-base">Notificações enviadas!</p>
                  <p className="text-sm opacity-90 mt-1">
                    Enviadas com sucesso: <span className="font-extrabold text-white">{result.data?.successCount}</span> <br/>
                    Falhas (inscrições limpas): <span className="font-extrabold text-white">{result.data?.failCount}</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mt-0.5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-bold text-white text-base">Falha na Operação</p>
                  <p className="text-sm opacity-95 mt-1 leading-relaxed">
                    {result.message || "Erro desconhecido ao tentar enviar a notificação."}
                  </p>
                </div>
              </>
            )}
          </div>

          {!result.success && result.error === "VAPID_KEYS_NOT_CONFIGURED" && (
            <div className="mt-3 p-4 bg-black/40 border border-red-500/20 rounded-lg text-xs space-y-3">
              <p className="font-bold text-zinc-200">Como configurar as chaves VAPID no ambiente do seu Convex:</p>
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Opção 1: Pelo terminal local (CMD do Windows)</span>
                <pre className="bg-zinc-950 p-2.5 rounded font-mono text-[10px] text-zinc-300 select-all overflow-x-auto block">
                  cmd /c "npx convex env set NEXT_PUBLIC_VAPID_PUBLIC_KEY BKFP5-izjXIE5iTKadFU-43uxoc9ySKsp111xLIcs_PxkgA_dWSjKyoAd-Pb2lECsqaI4tfty5ySbSfpH4Co3hQ"{"\n"}
                  cmd /c "npx convex env set VAPID_PRIVATE_KEY NyH8N31w-b0A2qQAB6xdNwfBbLSoJX1VQOceEg7iIwo"
                </pre>
              </div>

              <div className="space-y-1 pt-1 border-t border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Opção 2: Pelo painel web do Convex (Recomendado para Produção)</span>
                <ol className="list-decimal list-inside text-zinc-400 space-y-1">
                  <li>Acesse o <a href="https://dashboard.convex.dev" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Dashboard do Convex</a>.</li>
                  <li>Selecione o seu projeto e vá em <strong className="text-zinc-300">Settings &gt; Environment Variables</strong>.</li>
                  <li>Adicione as duas variáveis copiadas do seu <code className="text-zinc-300 font-mono">.env.local</code>.</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
