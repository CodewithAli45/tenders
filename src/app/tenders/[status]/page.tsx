import { ArrowLeft, Gavel } from "lucide-react";
import Link from "next/link";

const budgetValues = [3.5, 7.2, 1.8];

export default async function TenderPage({ params }: { params: Promise<{ status: string }> }) {
  const { status } = await params;
  const statusName = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="min-h-screen bg-background p-[2%] pt-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">{statusName} Tenders</h1>
          <div className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            Live Updates
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border border-black/5 dark:border-white/10 flex items-center justify-between group cursor-pointer hover:bg-black/[0.02] transition-all">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center">
                  <Gavel className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold group-hover:text-primary transition-colors">Tender Project #{202400 + i}</h3>
                  <p className="text-xs text-muted-foreground">Department of Infrastructure • Updated 2 hours ago</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">₹ {budgetValues[i - 1]} Cr</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Estimated Budget</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl text-center">
          <p className="text-sm text-primary font-medium">Looking for specific results? Use the advanced filters on the main dashboard.</p>
        </div>
      </div>
    </div>
  );
}
