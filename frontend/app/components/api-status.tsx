"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://hiremind-ai-api.onrender.com";

export default function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    fetch(`${API_URL}/health`, { cache: "no-store" })
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
