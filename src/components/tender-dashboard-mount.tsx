"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import type { MappedTender } from "@/lib/tender-mapping";

const TenderDashboard = dynamic(() => import("@/components/tender-dashboard"), {
  ssr: false,
});

export function TenderDashboardMount({
  initialTenders,
  children,
}: {
  initialTenders: MappedTender[];
  children: ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

  return (
    <>
      {!ready && children}
      <div className={ready ? "contents" : "hidden"}>
        <TenderDashboard initialTenders={initialTenders} onReady={handleReady} />
      </div>
    </>
  );
}
