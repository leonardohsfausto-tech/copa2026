"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushModal() {
  const [showModal, setShowModal] = useState(false);
  const saveSubscription = useMutation(api.push.saveSubscription);
  const { user } = useUser();

  useEffect(() => {
    // Verificar se o navegador suporta service workers e push
    if ("serviceWorker" in navigator && "PushManager" in window) {
      if (Notification.permission === "default") {
        // Mostra o modal se ainda não foi perguntado
        const timer = setTimeout(() => {
          setShowModal(true);
        }, 3000);
        return () => clearTimeout(timer);
      } else if (Notification.permission === "granted") {
        // Tenta inscrever silenciosamente caso o usuário logue de novo, etc.
        subscribeToPush();
      }
    }
  }, [user]);

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      let sub = await registration.pushManager.getSubscription();
      
      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        });
      }

      const subData = JSON.parse(JSON.stringify(sub));
      
      await saveSubscription({
        userId: user?.id,
        endpoint: subData.endpoint,
        keys: {
          p256dh: subData.keys.p256dh,
          auth: subData.keys.auth,
        },
      });
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao se inscrever em notificações:", error);
      setShowModal(false);
    }
  };

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await subscribeToPush();
    } else {
      setShowModal(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-2xl z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h3 className="text-zinc-100 font-semibold">Ativar Notificações</h3>
            <p className="text-zinc-400 text-sm mt-1">Receba alertas de jogos e resultados em tempo real da Copa.</p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => setShowModal(false)}
          className="flex-1 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Agora Não
        </button>
        <button 
          onClick={requestPermission}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors"
        >
          Ativar
        </button>
      </div>
    </div>
  );
}
