import { useEffect, useRef } from "react";
import { createCentrifugoForProject } from "@/services/centrifugoClient.js";

export function useProjectWs(projectId, enabled) {
  const centrifugeRef = useRef(null);
  const subRef = useRef(null);

  useEffect(() => {
    if (!enabled || !projectId) return;

    let cancelled = false;

    (async () => {
      try {
        const { centrifuge, sub } = await createCentrifugoForProject(projectId);

        if (cancelled) {
          sub.unsubscribe();
          centrifuge.disconnect();
          return;
        }

        centrifugeRef.current = centrifuge;
        subRef.current = sub;
      } catch (err) {
        console.error("[WS] init error:", err);
      }
    })();

    return () => {
      cancelled = true;

      if (subRef.current) {
        subRef.current.unsubscribe();
        console.log(
          "[WS] cleanup disconnect → sub state:",
          subRef.current.state
        );
        subRef.current = null;
      }
      if (centrifugeRef.current) {
        centrifugeRef.current.disconnect();
        console.log(
          "[WS] cleanup disconnect → centrifuge state:",
          centrifugeRef.current.state
        );
        centrifugeRef.current = null;
      }
    };
  }, [projectId, enabled]);
}