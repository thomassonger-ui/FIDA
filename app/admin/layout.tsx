import { Sidebar } from "@/components/admin/Sidebar";
import { AtticusCopyrightBar } from "@/components/AtticusCopyrightBar";
// import { DemoBanner } from "@/components/admin/DemoBanner"; // re-enable for demos

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
      {/* <DemoBanner />  // re-enable for demos */}
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 px-6 md:px-8 py-8">{children}</div>
          <AtticusCopyrightBar />
        </div>
      </div>
    </div>
  );
}
