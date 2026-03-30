import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-[#FCFBF7] min-h-screen text-[#321B13] font-sans selection:bg-[#FF6B00]/10">
      <Sidebar />
      <div className="flex-1 ml-72">
        {children}
      </div>
    </div>
  );
}
