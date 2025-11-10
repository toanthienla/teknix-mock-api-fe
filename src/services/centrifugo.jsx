import { useEffect, useRef } from "react";
import { Centrifuge } from "centrifuge";
import { getCentrifugoToken, getSubToken } from "@/services/api.js";
import { API_WS_ROOT } from "@/utils/constants.js";

export default function RealtimeClient({ userId, onNewNotification }) {
  const centrifugeRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        // Lấy connection token cho client
        const { token } = await getCentrifugoToken();
        console.log("[Centrifugo] connection token:", token);

        const centrifuge = new Centrifuge(API_WS_ROOT, { token });

        centrifuge.on("connected", (ctx) => console.log("[Centrifugo] connected ✅", ctx));
        centrifuge.on("disconnected", (ctx) => console.warn("[Centrifugo] disconnected ❌", ctx));
        centrifuge.on("error", (err) => console.error("[Centrifugo] error:", err));

        centrifuge.connect();

        // Chuẩn bị channel và lấy sub token riêng
        const channel = `user_${userId}#notifications`;
        console.log(`[Centrifugo] subscribing to ${channel}`);

        const { token: subtoken } = await getSubToken(userId, channel);
        console.log("[Centrifugo] sub token:", subtoken);

        // Tạo subscription với subtoken
        const sub = centrifuge.newSubscription(channel, { token: subtoken });

        sub.on("subscribed", (ctx) => console.log(`🟢 Subscribed to ${channel}`, ctx));
        sub.on("error", (err) => console.error(`❌ Subscription error on ${channel}`, err));
        sub.on("publication", (ctx) => {
          // console.log("📩 Notification received:", ctx.data);
          if (onNewNotification) onNewNotification(ctx.data);
        });

        await sub.subscribe();

        centrifugeRef.current = centrifuge;
      } catch (error) {
        console.error("[Centrifugo] initialization failed:", error);
      }
    })();

    return () => {
      if (centrifugeRef.current) {
        centrifugeRef.current.disconnect();
      }
    };
  }, [userId]);

  return null;
}
