'use client';

import Sidebar from '@/src/components/common/admin-panel/Sidebar';
import Navbar from '@/src/components/common/admin-panel/Navbar';

interface AdminPanelProps {
  children: React.ReactNode;
}

export default function AdminPanel({ children }: AdminPanelProps) {
  return (
    <div className="flex min-h-screen bg-[#fcfcf9]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

