'use client';

// import Sidebar from '@/src/components/common/admin-panel/Sidebar';
// import Navbar from '@/src/components/common/admin-panel/Navbar';
import Navbar from '@/components/common/admin-panel/Navbar';
import Sidebar from '@/components/common/admin-panel/Sidebar';

export default function AdminContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#fcfcf9]">
      <Sidebar />
      <div className="ml-[280px] flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
