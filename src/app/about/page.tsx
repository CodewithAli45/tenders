import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background p-[2%] pt-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </a>
        <h1 className="text-4xl font-bold tracking-tight">About Us</h1>
        <div className="glass-card p-8 rounded-3xl border border-black/5 dark:border-white/10 space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            GovTender Hub is a state-of-the-art platform designed to streamline government tender management. 
            We provide real-time updates and professional tools to help companies and individuals 
            participate in government opportunities with ease and efficiency.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-2">
              <h3 className="font-bold">Our Mission</h3>
              <p className="text-sm text-muted-foreground">To bring transparency and accessibility to the government tendering process through innovation and technology.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold">Our Vision</h3>
              <p className="text-sm text-muted-foreground">To become the leading global interface for government-to-business commerce and project management.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
