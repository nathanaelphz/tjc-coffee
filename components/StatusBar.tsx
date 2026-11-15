"use client";

import { useEffect, useState } from "react";
import { subscribeStatus } from "@/lib/data";

export default function StatusBar() {
  const [error, setError] = useState<string | null>(null);
  useEffect(() => subscribeStatus((s) => setError(s.error)), []);

  if (error)
    return (
      <div role="alert" className="status">
        <strong>Can&apos;t reach the database.</strong> {error}
      </div>
    );

  return (
    <p className="live" aria-label="Connected to the live database">
      <i /> Live
    </p>
  );
}
