// force-dynamic at the route segment level means every request to /portal/login
// (and any other unauth route under this segment) gets fresh HTML pointing at
// the current JS chunk hash. Prevents stale cached chunks after a deploy.
export const dynamic = "force-dynamic";

export default function PortalUnauthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
