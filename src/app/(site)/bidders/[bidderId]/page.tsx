import { notFound } from "next/navigation";
import { supabaseRequest } from "@/lib/supabase-server";

export default async function BidderProfilePage({ params }: { params: Promise<{ bidderId: string }> }) {
  const { bidderId } = await params;
  try {
    const response = await supabaseRequest(`/rest/v1/bidder_profiles?id=eq.${encodeURIComponent(bidderId)}&select=id,name,contact_person,email,phone,address,notes`);
    const profile = (await response.json())[0];
    if (!profile) notFound();
    const details = [["Contact person", profile.contact_person], ["Email", profile.email], ["Phone", profile.phone], ["Address", profile.address]] as const;
    return <main className="mx-auto min-h-[60vh] w-full max-w-3xl px-4 py-12"><p className="text-xs font-bold uppercase tracking-widest text-primary">Bidder information</p><h1 className="mt-2 text-3xl font-bold">{profile.name}</h1><dl className="mt-8 grid gap-3 sm:grid-cols-2">{details.filter(([, value]) => value).map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-card p-4"><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-semibold">{value}</dd></div>)}</dl>{profile.notes && <section className="mt-4 rounded-xl border border-border bg-card p-4"><h2 className="text-sm font-bold">Additional information</h2><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{profile.notes}</p></section>}</main>;
  } catch {
    notFound();
  }
}
