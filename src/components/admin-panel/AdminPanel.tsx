'use client';

import Navbar from '@/components/shared/Navbar';
import Sidebar from '@/components/shared/Sidebar';

interface AdminPanelProps {
  children: React.ReactNode;
}

export default function AdminPanel({ children }: Readonly<AdminPanelProps>) {
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
