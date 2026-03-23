import { ArrowLeft, Briefcase } from "lucide-react";

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const serviceName = service.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="min-h-screen bg-background p-[2%] pt-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </a>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">{serviceName}</h1>
          <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Expert Service</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-card p-8 rounded-3xl border border-black/5 dark:border-white/10 space-y-6">
            <h2 className="text-2xl font-bold">Service Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our {serviceName} service provides comprehensive support for your government tendering needs. 
              Our team of experts will guide you through every step of the process, ensuring 
              highest quality results and maximum success probability.
            </p>
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                What's Included
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["Expert Consultation", "Technical Documentation", "Compliance Review", "Strategy Development"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-primary/20 bg-primary/5">
              <h3 className="font-bold mb-2">Request Quote</h3>
              <p className="text-xs text-muted-foreground mb-4">Interested in {serviceName}? Get a customized quote within 24 hours.</p>
              <button className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                Inquire Now
              </button>
            </div>
            
            <div className="glass-card p-6 rounded-2xl border border-black/5 dark:border-white/10">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Case Studies
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5">
                  <p className="text-xs font-bold">Smart City Phase 1</p>
                  <p className="text-[10px] text-muted-foreground">Successfully prepared and finalized.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
