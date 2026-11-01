import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteSearchProvider } from "@/components/site-search-context";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteSearchProvider>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative flex flex-col font-sans">
        <SiteHeader />

        {/* Main Full-Screen Layout Container */}
        <div className="site-main-layout flex w-full flex-1 pt-28 px-[1%]">
          <main className="w-full flex-1 pb-16">{children}</main>
        </div>

        <SiteFooter />
      </div>
    </SiteSearchProvider>
  );
}
