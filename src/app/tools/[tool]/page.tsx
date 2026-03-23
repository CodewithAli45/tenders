import { ArrowLeft } from "lucide-react";

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const toolName = tool.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="min-h-screen bg-background p-[2%] pt-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </a>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">{toolName}</h1>
          <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Professional Tool</span>
        </div>
        <div className="glass-card p-12 rounded-3xl border border-black/5 dark:border-white/10 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
          <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <div className="h-10 w-10 bg-primary rounded-xl" />
          </div>
          <h2 className="text-2xl font-bold">Tool Interface Coming Soon</h2>
          <p className="text-muted-foreground max-w-md">
            We are currently developing the specialized interface for {toolName}. 
            This tool will feature advanced analytics, automated processing, and export options.
          </p>
          <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            Get Notified on Launch
          </button>
        </div>
      </div>
    </div>
  );
}
