import { Suspense } from 'react';

import OffboardingPanel from '@/components/admin-panel/OffboardingPanel';

export default function OffboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OffboardingPanel />
    </Suspense>
  );
}
