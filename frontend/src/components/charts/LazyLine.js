import { jsx as _jsx } from "react/jsx-runtime";
import { lazy, Suspense } from 'react';
const Line = lazy(() => import('react-chartjs-2').then((mod) => ({ default: mod.Line })));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LazyLine(props) {
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "h-64 bg-gray-50 rounded animate-pulse" }), children: _jsx(Line, { ...props }) }));
}
