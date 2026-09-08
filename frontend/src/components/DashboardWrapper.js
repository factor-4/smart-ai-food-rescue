import { jsx as _jsx } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
export default function DashboardWrapper() {
    const { restaurantId } = useParams();
    return _jsx(DashboardPage, { restaurantId: Number(restaurantId) });
}
