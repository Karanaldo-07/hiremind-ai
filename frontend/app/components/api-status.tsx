"use client";

import { useEffect, useState } from "react";

export default function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    fetch("/api/health", { cache: "no-store" })
      .then((response) => {
        setStatus(response.ok ? "online" : "offline");
      })
      .catch(() => setStatus("offline"));
  }, []);

  const labels = {
    checking: "Connecting to API…",
    online: "API connected",
    offline: "API not connected",
  };

  return (
    <span className={`api-status api-${status}`} aria-live="polite">
      <span className="api-dot" />
      {labels[status]}
    </span>
  );
}
