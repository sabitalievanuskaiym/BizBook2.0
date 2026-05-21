import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Gift, Clock, MapPin, Loader2 } from 'lucide-react';
import { appointmentApi, authApi } from '../utils/api';

const statusStyle = {
  pending: 'bg-amber-500/15 text-amber-300',
  completed: 'bg-emerald-500/15 text-emerald-300',
  cancelled: 'bg-red-500/15 text-red-400',
};

const ClientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [me, appts] = await Promise.all([authApi.me(), appointmentApi.my()]);
        setUser(me.user);
        setAppointments(appts.appointments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter((a) => a.status === 'pending' && a.date >= today);
  const history = appointments.filter((a) => a.date < today || a.status !== 'pending');

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My dashboard</h1>
          <p className="mt-1 text-zinc-400">Welcome back, {user?.name}</p>
        </div>
        <Link to="/book" className="btn-primary">
          <Calendar className="h-4 w-4" />
          New booking
        </Link>
      </div>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <article className="card border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-zinc-900 lg:col-span-1">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-amber-500/20 p-3 text-amber-400">
              <Gift className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm text-zinc-400">Loyalty cashback balance</p>
              <p className="text-3xl font-bold text-amber-400">{user?.bonusBalance ?? 0} KGS</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            You earn 5% of each completed visit price as bonus balance. Redeem on your next service.
          </p>
        </article>

        <article className="card lg:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Clock className="h-5 w-5 text-amber-400" />
            Upcoming appointments
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No upcoming visits. Book your next cut!</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.map((a) => (
                <li key={a._id} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">{a.serviceName}</p>
                      <p className="text-sm text-zinc-500">
                        {a.date} · {a.time} · {a.masterId?.name}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                        <MapPin className="h-3 w-3" />
                        {a.branchId?.name}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[a.status]}`}>
                      {a.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      <section className="card mt-8">
        <h2 className="text-lg font-semibold text-white">Booking history</h2>
        {history.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No past appointments yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-3 pr-4 font-medium">Service</th>
                  <th className="pb-3 pr-4 font-medium">Branch</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Price</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((a) => (
                  <tr key={a._id} className="border-b border-zinc-800/50">
                    <td className="py-3 pr-4 text-white">{a.serviceName}</td>
                    <td className="py-3 pr-4 text-zinc-400">{a.branchId?.name}</td>
                    <td className="py-3 pr-4 text-zinc-400">
                      {a.date} {a.time}
                    </td>
                    <td className="py-3 pr-4 text-zinc-400">{a.price} KGS</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusStyle[a.status]}`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ClientDashboard;
