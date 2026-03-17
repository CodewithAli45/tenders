import { AdminDashboard } from "@/components/admin-dashboard";

export default function AdminPage() {
  return (
    <div className="h-screen w-screen">
      <AdminDashboard isModal={false} />
    </div>
  );
}
