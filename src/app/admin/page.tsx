import { AdminDashboard } from "@/components/admin-dashboard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div className="h-screen w-screen">
      <AdminDashboard isModal={false} />
    </div>
  );
}
