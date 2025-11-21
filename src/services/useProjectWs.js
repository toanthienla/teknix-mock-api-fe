import { useEffect, useRef } from "react";
import { createCentrifugoForProject } from "./centrifugoClient";

export function useProjectWs(projectId, enabled = true) {
  const centrifugeRef = useRef(null);

  useEffect(() => {
    if (!enabled || !projectId) return;

    let cancelled = false;

    (async () => {
      try {
        const { centrifuge } = await createCentrifugoForProject(projectId);

        if (cancelled) {
          centrifuge.disconnect();
          return;
        }

        centrifugeRef.current = centrifuge;
      } catch (err) {
        console.error("[centrifugo] init error:", err);
      }
    })();

    return () => {
      cancelled = true;

      if (centrifugeRef.current) {
        centrifugeRef.current.disconnect();
        centrifugeRef.current = null;
      }
    };
  }, [projectId, enabled]);
}