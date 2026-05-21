import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { DollarSign, Calendar, TrendingUp, Users, Loader2 } from 'lucide-react';
import { adminApi } from '../utils/api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .analytics()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-red-400">{error}</div>
    );
  }

  const kpis = [
    {
      label: 'Total Revenue',
      value: `${(data?.totalRevenue || 0).toLocaleString()} KGS`,
      icon: DollarSign,
      accent: 'text-emerald-400',
    },
    {
      label: 'Completed Bookings',
      value: data?.totalBookings || 0,
      icon: Calendar,
      accent: 'text-amber-400',
    },
    {
      label: 'All Bookings',
      value: data?.totalBookingsAll || 0,
      icon: TrendingUp,
      accent: 'text-sky-400',
    },
    {
      label: 'Pending',
      value: data?.pendingBookings || 0,
      icon: Users,
      accent: 'text-violet-400',
    },
  ];

  const chartTooltipStyle = {
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '0.75rem',
    color: '#fafafa',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Executive dashboard</h1>
      <p className="mt-1 text-zinc-400">Network-wide performance and revenue insights</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, accent }) => (
          <article key={label} className="card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">{label}</p>
              <Icon className={`h-5 w-5 ${accent}`} />
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{value}</p>
          </article>
        ))}
      </div>

      <article className="card mt-8">
        <h2 className="text-lg font-semibold text-white">Monthly growth</h2>
        <p className="text-sm text-zinc-500">Bookings and revenue by month</p>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.monthlyGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="month" stroke="#a1a1aa" fontSize={12} />
              <YAxis stroke="#a1a1aa" fontSize={12} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#f59e0b" strokeWidth={2} name="Bookings" />
              <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={2} name="Revenue (KGS)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="card">
          <h2 className="text-lg font-semibold text-white">Revenue by branch</h2>
          <p className="text-sm text-zinc-500">Completed appointment revenue</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.revenuePerBranch || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="branchName" stroke="#a1a1aa" fontSize={11} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="revenue" fill="#f59e0b" name="Revenue (KGS)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card">
          <h2 className="text-lg font-semibold text-white">Branch popularity</h2>
          <p className="text-sm text-zinc-500">Completed bookings volume by branch</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.revenuePerBranch || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="branchName" stroke="#a1a1aa" fontSize={11} />
                <YAxis stroke="#a1a1aa" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="bookings" fill="#a78bfa" name="Bookings" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <article className="card mt-8">
        <h2 className="text-lg font-semibold text-white">Master performance</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="pb-3 pr-4 font-medium">Master</th>
                <th className="pb-3 pr-4 font-medium">Rating</th>
                <th className="pb-3 pr-4 font-medium">Bookings</th>
                <th className="pb-3 pr-4 font-medium">Revenue</th>
                <th className="pb-3 font-medium">Avg ticket</th>
              </tr>
            </thead>
            <tbody>
              {(data?.masterPerformance || []).map((m) => (
                <tr key={m.masterId} className="border-b border-zinc-800/50">
                  <td className="py-3 pr-4 font-medium text-white">{m.masterName}</td>
                  <td className="py-3 pr-4 text-amber-400">★ {m.rating}</td>
                  <td className="py-3 pr-4 text-zinc-400">{m.bookings}</td>
                  <td className="py-3 pr-4 text-zinc-400">{m.revenue?.toLocaleString()} KGS</td>
                  <td className="py-3 text-zinc-400">{m.avgTicket} KGS</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
};

export default AdminDashboard;
