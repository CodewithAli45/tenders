"use client";

import { Award, Building2, DollarSign, LayoutGrid, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { quickModules } from "@/lib/nav";

interface TenderStats {
  tenderValue: number;
  organization: string;
}

export function EnterpriseSidebar() {
  const [stats, setStats] = useState<TenderStats[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/public/tenders")
      .then((res) => res.json())
      .then((data) => {
        if (active) setStats(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setStats([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const totalValue = (stats ?? []).reduce(
    (sum, t) => sum + (t.tenderValue || 0),
    0
  );
  const organizationCount = new Set(
    (stats ?? []).map((t) => t.organization).filter(Boolean)
  ).size;

  const liveStats = [
    { icon: Building2, label: "Active Tenders", value: (stats ?? []).length.toLocaleString() },
    {
      icon: DollarSign,
      label: "Pipeline Value",
      value: `₹${(totalValue / 10000000).toFixed(0)} Cr`,
    },
    { icon: Award, label: "Organizations", value: `${organizationCount}` },
  ];

  return (
    <aside className="fixed left-[1%] top-28 hidden h-[calc(100vh-8rem)] w-64 flex-col border border-border rounded-2xl bg-card p-5 xl:flex shadow-xs overflow-y-auto">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            <LayoutGrid className="h-3.5 w-3.5 text-primary" />
            <span>Quick Modules</span>
          </div>
          <div className="space-y-1">
            {quickModules.map((item) => (
              <button
                key={item.label}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer flex items-center gap-2.5"
              >
                <item.icon className="h-3.5 w-3.5 text-primary/80" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span>Live Stats</span>
          </div>
          <div className="space-y-1">
            {liveStats.map((stat) => (
              <div
                key={stat.label}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all flex items-center gap-2.5"
              >
                <stat.icon className="h-3.5 w-3.5 text-primary/80" />
                <span>{stat.label}</span>
                <span className="ml-auto font-bold text-foreground">
                  {stats ? stat.value : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
