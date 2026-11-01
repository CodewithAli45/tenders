"use client";

import { createContext, useContext, useState } from "react";

interface SiteSearchContextValue {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SiteSearchContext = createContext<SiteSearchContextValue | null>(null);

export function SiteSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SiteSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SiteSearchContext.Provider>
  );
}

export function useSiteSearch() {
  const context = useContext(SiteSearchContext);
  if (!context) throw new Error("useSiteSearch must be used within SiteSearchProvider");
  return context;
}
