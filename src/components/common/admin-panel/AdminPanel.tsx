'use client';

import Navbar from '@/components/common/admin-panel/Navbar';
import Sidebar from '@/components/common/admin-panel/Sidebar';

interface AdminPanelProps {
  children: React.ReactNode;
}

export default function AdminPanel({ children }: AdminPanelProps) {
  return (
    <div className="flex min-h-screen bg-[#fcfcf9]">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
