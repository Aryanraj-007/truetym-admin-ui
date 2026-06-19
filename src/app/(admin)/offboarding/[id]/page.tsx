'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { TargetType } from '@/lib/offboarding';
import OffboardingPanel from '@/app/(admin)/offboarding/OffboardingPanel';

export default function OffboardingByIdPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const type = (searchParams.get('type') as TargetType) || 'org';

  return <OffboardingPanel initialId={id} initialType={type} />;
}
