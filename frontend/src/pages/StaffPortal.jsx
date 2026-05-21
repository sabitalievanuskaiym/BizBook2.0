import { useEffect, useState } from 'react';
import { Check, X, Loader2, Phone, MapPin, Clock } from 'lucide-react';
import { staffApi, appointmentApi } from '../utils/api';

const StaffPortal = () => {
  const [schedule, setSchedule] = useState({ date: '', appointments: [] });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const data = await staffApi.schedule();
      setSchedule(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await appointmentApi.updateStatus(id, status);
      await loadSchedule();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Today&apos;s schedule</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
          <Clock className="h-4 w-4" />
          {schedule.date}
        </p>
      </header>

      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

      {schedule.appointments.length === 0 ? (
        <div className="card text-center">
          <p className="text-zinc-400">No appointments for today. Enjoy the break!</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {schedule.appointments.map((a) => (
            <li key={a._id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold text-amber-400">{a.time}</p>
                  <p className="font-medium text-white">{a.clientName}</p>
                  <p className="text-sm text-zinc-400">{a.serviceName}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    a.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300'
                      : a.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {a.status}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm text-zinc-500">
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  {a.clientPhone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {a.branchId?.name}
                </p>
                <p className="font-medium text-zinc-300">{a.price} KGS</p>
              </div>

              {a.status === 'pending' && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    onClick={() => updateStatus(a._id, 'completed')}
                    disabled={updatingId === a._id}
                  >
                    <Check className="h-4 w-4" />
                    Complete
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-1 rounded-xl border border-red-500/50 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    onClick={() => updateStatus(a._id, 'cancelled')}
                    disabled={updatingId === a._id}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StaffPortal;
