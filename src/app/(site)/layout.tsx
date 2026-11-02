import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteSearchProvider } from "@/components/site-search-context";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteSearchProvider>
      <div className="relative flex min-h-dvh w-full flex-col bg-background font-sans text-foreground selection:bg-primary/30">
        <SiteHeader />

        {/* Main Full-Screen Layout Container */}
        <div className="site-main-layout flex w-full flex-1 pt-28 px-[1%] pb-[env(safe-area-inset-bottom)]">
          <main className="min-w-0 w-full flex-1 pb-16">{children}</main>
        </div>

        <SiteFooter />
      </div>
    </SiteSearchProvider>
  );
}
