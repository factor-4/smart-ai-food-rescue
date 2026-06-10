import { useQuery } from '@tanstack/react-query';
import axios from '../lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DailySale {
  date: string;
  count: number;
}

interface PopularBag {
  bagId: number;
  orderCount: number;
}

interface DashboardData {
  sales: DailySale[];
  totalRevenue: number;
  popularBags: PopularBag[];
}

export default function DashboardPage({ restaurantId }: { restaurantId: number }) {
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ['dashboard', restaurantId],
    queryFn: () =>
      axios.get(`/api/dashboard/${restaurantId}`).then((res) => res.data),
  });

  if (isLoading) return <p className="p-4">Loading dashboard…</p>;
  if (isError) return <p className="p-4 text-red-500">Failed to load dashboard data.</p>;

  const lineData = {
    labels: data?.sales?.map((s) => s.date) ?? [],
    datasets: [
      {
        label: 'Orders',
        data: data?.sales?.map((s) => s.count) ?? [],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        tension: 0.2,
        fill: false,
        pointRadius: 5,
      },
    ],
  };

  const barData = {
    labels: data?.popularBags?.map((b) => `Bag #${b.bagId}`) ?? [],
    datasets: [
      {
        label: 'Orders',
        data: data?.popularBags?.map((b) => b.orderCount) ?? [],
        backgroundColor: '#f97316',
        barThickness: 25,
        maxBarThickness: 25,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        offset: true,
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-700">Total Revenue (last 7 days)</p>
        <p className="text-3xl font-bold text-green-900">
          €{data?.totalRevenue.toFixed(2)}
        </p>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Daily Sales</h2>
        {data?.sales?.length ? (
          <div style={{ height: 300 }}>
            <Line data={lineData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-gray-500">No sales data for the past 7 days.</p>
        )}
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Top Bags</h2>
        {data?.popularBags?.length ? (
          <div style={{ height: 300 }}>
            <Bar data={barData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-gray-500">No orders yet.</p>
        )}
      </div>
    </div>
  );
}