'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';

import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/common/admin-panel/Sidebar';

export default function AdminPanel({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isSidebarOpen } = useAppSelector((state) => state.app);
  return (
    <>
      <Sidebar />
      <main
        className={cn(
          'min-h-[calc(100vh_-_56px)] transition-[margin-left] duration-300 ease-in-out dark:bg-zinc-900',
          !isSidebarOpen ? 'lg:ml-[90px]' : 'lg:ml-72',
        )}
      >
        {children}
      </main>
    </>
  );
}
