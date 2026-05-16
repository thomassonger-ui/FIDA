import { PortalSidebar } from "../Sidebar";
import { AtticusCopyrightBar } from "@/components/AtticusCopyrightBar";

export default function PortalAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="flex flex-1">
        <PortalSidebar />
        <div className="flex-1 flex flex-col">
          <div className="flex-1 px-8 md:px-12 py-10">{children}</div>
          <AtticusCopyrightBar />
        </div>
      </div>
    </div>
  );
}
