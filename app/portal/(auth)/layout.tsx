import { PortalSidebar } from "../Sidebar";

export default function PortalAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="flex flex-1">
        <PortalSidebar />
        <div className="flex-1 px-8 md:px-12 py-10">{children}</div>
      </div>
    </div>
  );
}
