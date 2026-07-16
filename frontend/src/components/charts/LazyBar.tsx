import { lazy, Suspense } from 'react';

const Bar = lazy(() =>
  import('react-chartjs-2').then((mod) => ({ default: mod.Bar }))
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LazyBar(props: any) {
  return (
    <Suspense fallback={<div className="h-64 bg-gray-50 rounded animate-pulse" />}>
      <Bar {...props} />
    </Suspense>
  );
}