import { Sidebar } from "@/components/admin/Sidebar";
import { DemoBanner } from "@/components/admin/DemoBanner";

export const metadata = {
  title: "Admin &middot; FIDA",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <DemoBanner />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 px-8 md:px-12 py-10">{children}</div>
      </div>
    </div>
  );
}
