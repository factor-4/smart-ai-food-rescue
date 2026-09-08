import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// Helper component to move the map view when props change
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
}
export function BagMap({ bags, center }) {
    const defaultCenter = [center.lat, center.lng];
    // In a later step,  use geolocation to update center
    return (_jsxs(MapContainer, { center: defaultCenter, zoom: 13, style: { height: '100%', width: '100%' }, children: [_jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), _jsx(ChangeView, { center: defaultCenter }), bags.map((bag) => (_jsx(Marker, { position: [bag.latitude, bag.longitude], children: _jsx(Popup, { children: _jsxs("div", { children: [_jsx("strong", { children: bag.name }), _jsx("br", {}), "Discounted: \u20AC", bag.discountedPrice.toFixed(2)] }) }) }, bag.id)))] }));
}
