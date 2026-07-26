'use client';

import { useEffect, useRef } from 'react';
import { rehydrateAuth } from '@/store/slices/authSlice';
import { store } from '@/store/store';
import { Provider } from 'react-redux';

export default function StoreProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      store.dispatch(rehydrateAuth());
      hydrated.current = true;
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
