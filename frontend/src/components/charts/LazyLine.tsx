import { lazy, Suspense } from 'react';

const Line = lazy(() =>
  import('react-chartjs-2').then((mod) => ({ default: mod.Line }))
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LazyLine(props: any) {
  return (
    <Suspense fallback={<div className="h-64 bg-gray-50 rounded animate-pulse" />}>
      <Line {...props} />
    </Suspense>
  );
}