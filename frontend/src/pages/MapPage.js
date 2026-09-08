import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import axios from '../lib/api';
import { BagMap } from '../components/BagMap';
import { useGeolocation } from '../hooks/useGeolocation';
function getDistanceInKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
export default function MapPage() {
    const { location, error: geoError, loading: geoLoading } = useGeolocation();
    const { data: bags, isLoading, isError } = useQuery({
        queryKey: ['bags-map'],
        queryFn: () => axios.get('/api/bags?size=1000').then((res) => res.data.content ?? res.data),
    });
    if (isLoading || geoLoading)
        return _jsx("p", { className: "p-4", children: "Loading map\u2026" });
    if (isError)
        return _jsx("p", { className: "p-4 text-red-500", children: "Failed to load bags." });
    let geoBags = (bags ?? []).filter((b) => b.latitude && b.longitude);
    if (location) {
        geoBags = geoBags.filter((bag) => {
            const distance = getDistanceInKm(location.lat, location.lng, bag.latitude, bag.longitude);
            return distance <= 3;
        });
    }
    const mapCenter = location
        ? { lat: location.lat, lng: location.lng }
        : { lat: 60.1695, lng: 24.9354 }; // default Helsinki
    return (_jsxs("div", { className: "px-4 sm:px-6 py-6 max-w-6xl mx-auto space-y-4", children: [_jsxs("h1", { className: "text-2xl font-bold", children: ["Nearby Rescue Bags", geoError && (_jsxs("span", { className: "text-sm text-gray-500 ml-2", children: ["(using default location: ", geoError, ")"] }))] }), _jsx("div", { className: "w-full h-[50vh] sm:h-[60vh] md:h-[70vh] rounded-xl overflow-hidden border border-slate-200", children: _jsx(BagMap, { bags: geoBags, center: mapCenter }) })] }));
}
