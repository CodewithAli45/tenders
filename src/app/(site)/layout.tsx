import { EnterpriseSidebar } from "@/components/enterprise-sidebar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative flex flex-col font-sans">
      <SiteHeader />

      {/* Main Full-Screen Layout Container */}
      <div className="flex w-full flex-1 pt-28 px-[1%] gap-6">
        <EnterpriseSidebar />

        {/* Main Content Area */}
        <main className="flex-1 xl:ml-70 pb-16">{children}</main>
      </div>

      <SiteFooter />
    </div>
  );
}
