
'use client';
// import Sidebar from '@/src/components/common/admin-panel/Sidebar';
// import Navbar from '@/src/components/common/admin-panel/Navbar';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AdminContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#fcfcf9]">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[280px]">
        <Navbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


