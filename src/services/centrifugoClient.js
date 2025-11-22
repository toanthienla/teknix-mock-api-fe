import { Centrifuge } from "centrifuge";
import { getProjectConnectToken } from "@/services/api.js";

export async function createCentrifugoForProject(projectId) {
  const { ws_url, token, subs } = await getProjectConnectToken(projectId);

  // Khởi tạo client
  const centrifuge = new Centrifuge(ws_url, {
    token: token,

    // refresh token tự động khi cần
    getToken: async (ctx) => {
      console.log("[centrifugo] token expired, reason:", ctx.reason);
      const data = await getProjectConnectToken(projectId);
      return data.token;
    }
  });

  // ===== Log trạng thái kết nối =====
  centrifuge.on("connecting", (ctx) => {
    console.log("[centrifugo] connecting...", ctx);
  });

  centrifuge.on("connected", (ctx) => {
    console.log("[centrifugo] connected!", ctx);
    console.log("[centrifugo] WS State (connected):", centrifuge.state);
  });

  centrifuge.on("disconnected", (ctx) => {
    console.log("[centrifugo] disconnected!", ctx);
    console.log("[centrifugo] WS State (disconnected):", centrifuge.state);
  });

  // ===== Client tự subscribe channel pj:ID =====
  const channel = `pj:${projectId}`;
  const sub = centrifuge.newSubscription(channel);

  sub.on("subscribing", (ctx) => {
    console.log("[centrifugo] subscribing", ctx.channel);
  });

  sub.on("subscribed", (ctx) => {
    console.log("[centrifugo] subscribed", ctx.channel);
  });

  sub.on("unsubscribed", (ctx) => {
    console.log("[centrifugo] unsubscribed", ctx.channel);
  });

  sub.on("publication", (ctx) => {
    console.log("[centrifugo] message:", ctx.data);
  });

  // Thực hiện subscribe
  sub.subscribe();

  // Connect
  centrifuge.connect();

  console.log("[centrifugo] State", centrifuge.state);
  return { centrifuge, sub };
}
