'use client';

import Navbar from '@/components/shared/Navbar';
import Sidebar from '@/components/shared/Sidebar';

export default function AdminContentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-[#fcfcf9]">
      <Sidebar />
      <div className="ml-70 flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
