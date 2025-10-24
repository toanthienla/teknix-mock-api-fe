// src/realtime.jsx
import { useEffect, useRef } from "react";
import { Centrifuge } from "centrifuge";
import { getCentrifugoToken } from "@/services/api.js";

export default function RealtimeClient({ userId, onNewNotification }) {
  const centrifugeRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        console.log("Connecting to realtime with userId:", userId);

        const { token } = await getCentrifugoToken();
        console.log("[Centrifugo] token:", token);

        const centrifuge = new Centrifuge("ws://127.0.0.1:8080/connection/websocket", {
          token,
        });
        console.log("[Centrifugo] centrifuge:", centrifuge);

        centrifuge.on("connected", (ctx) => console.log("[Centrifugo] connected", ctx));
        centrifuge.on("disconnected", (ctx) => console.log("[Centrifugo] disconnected", ctx));
        centrifuge.on("error", (err) => console.error("[Centrifugo] error", err));

        // Đăng ký kênh theo user
        const channel = `user#${userId}`;
        const sub = centrifuge.newSubscription(channel);

        sub.on("publication", (ctx) => {
          console.log("Notification received:", ctx.data);
          if (onNewNotification) onNewNotification(ctx.data);
          // Có thể cập nhật UI, hiển thị toast, badge, v.v.
        });

        await sub.subscribe();
        centrifuge.connect();

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
