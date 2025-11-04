import React from 'react';

import { Navbar } from '@/components/common/admin-panel/Navbar';

interface AdminContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function AdminContentLayout({ title, children }: Readonly<AdminContentLayoutProps>) {
  return (
    <div>
      <Navbar title={title} />
      <div className="m-10 flex items-center px-2 py-3 sm:px-8">{children}</div>
    </div>
  );
}
