'use client';

import React, { useRef } from 'react';
import { makeStore } from '@/store/store';
import type { AppStore } from '@/store/store';
import { Provider } from 'react-redux';

export default function StoreProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const storeRef = useRef<AppStore | undefined>(undefined);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
