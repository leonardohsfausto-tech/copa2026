"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import webpush from "web-push";

// Define chaves VAPID
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:leonardohs.fausto@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export const sendNotificationToAll = action({
  args: {
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return { 
        success: false, 
        error: "VAPID_KEYS_NOT_CONFIGURED",
        message: "As chaves VAPID não estão configuradas no ambiente do Convex. Cadastre NEXT_PUBLIC_VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY nas variáveis de ambiente do seu dashboard Convex."
      };
    }

    const subs = await ctx.runQuery(internal.push.getAllSubscriptions);
    
    let successCount = 0;
    let failCount = 0;

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      url: args.url || "/",
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          payload
        );
        successCount++;
      } catch (err: any) {
        console.error("Falha ao enviar push para", sub.endpoint, err);
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Inscrição expirada ou inválida, remove do banco
          await ctx.runMutation(internal.push.internalRemoveSubscription, { endpoint: sub.endpoint });
        }
        failCount++;
      }
    }

    return { success: true, successCount, failCount };
  },
});
