import { useParams } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';

export default function DashboardWrapper() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  return <DashboardPage restaurantId={Number(restaurantId)} />;
}