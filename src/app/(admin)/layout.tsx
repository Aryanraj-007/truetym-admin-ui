'use client';

import React from 'react';

import AdminPanel from '@/components/common/admin-panel/AdminPanel';

export default function AdminPanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminPanel>{children}</AdminPanel>;
}
