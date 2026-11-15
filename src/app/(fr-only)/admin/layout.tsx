import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Back-office | Aymen Promotion" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#031B17] text-white">{children}</div>;
}
