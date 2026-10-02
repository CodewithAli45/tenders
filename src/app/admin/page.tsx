import { AdminDashboard } from "@/components/admin-dashboard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const params = await searchParams;
  const initialSection = params.section === "tracking" ? "tracking" : "tenders";
  if (!(await isAdminAuthenticated())) {
    redirect(initialSection === "tracking" ? "/admin/login?next=%2Fadmin%3Fsection%3Dtracking" : "/admin/login");
  }

  return (
    <div className="h-screen w-screen">
      <AdminDashboard isModal={false} initialSection={initialSection} />
    </div>
  );
}
