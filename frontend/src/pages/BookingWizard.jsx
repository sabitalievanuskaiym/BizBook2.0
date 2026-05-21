import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import MapPicker from '../components/MapPicker';
import { appointmentApi, getStoredUser } from '../utils/api';

const SERVICE_PRICES = {
  'Classic Cut': 800,
  'Beard Trim': 500,
  'Hot Towel Shave': 1200,
  Fade: 900,
  'Line Up': 600,
  'Kids Cut': 700,
  'Premium Cut': 1500,
  'Beard Sculpt': 800,
  'Hair Coloring': 2500,
  'Buzz Cut': 500,
};

const STEPS = ['Branch', 'Master & Service', 'Date & Time', 'Confirm'];

const BookingWizard = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [step, setStep] = useState(0);
  const [branches, setBranches] = useState([]);
  const [masters, setMasters] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState(user?.name || '');
  const [clientPhone, setClientPhone] = useState('');

  useEffect(() => {
    appointmentApi
      .getBranches()
      .then((data) => setBranches(data.branches || []))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedBranch?._id) return;
    setSelectedMaster(null);
    setSelectedService('');
    appointmentApi
      .getMasters(selectedBranch._id)
      .then((data) => setMasters(data.masters || []))
      .catch((err) => setError(err.message));
  }, [selectedBranch]);

  useEffect(() => {
    if (!selectedBranch?._id || !selectedMaster?._id || !selectedDate) return;
    setSelectedTime('');
    setLoading(true);
    appointmentApi
      .getSlots(selectedBranch._id, selectedMaster._id, selectedDate)
      .then((data) => setSlots(data.slots || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedBranch, selectedMaster, selectedDate]);

  const price = SERVICE_PRICES[selectedService] || 800;

  const minDate = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const canNext = () => {
    if (step === 0) return !!selectedBranch;
    if (step === 1) return !!selectedMaster && !!selectedService;
    if (step === 2) return !!selectedDate && !!selectedTime;
    if (step === 3) return clientName.trim() && clientPhone.trim();
    return false;
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await appointmentApi.create({
        branchId: selectedBranch._id,
        masterId: selectedMaster._id,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        serviceName: selectedService,
        price,
        date: selectedDate,
        time: selectedTime,
      });
      setSuccess(true);
      setTimeout(() => navigate(user ? '/dashboard' : '/'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="card">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Check className="h-8 w-8" />
          </span>
          <h2 className="mt-6 text-2xl font-bold text-white">Booking confirmed!</h2>
          <p className="mt-2 text-zinc-400">We will see you at {selectedBranch?.name} on {selectedDate} at {selectedTime}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Book an appointment</h1>
      <p className="mt-2 text-zinc-400">Complete all steps to reserve your slot</p>

      <ol className="mt-8 flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`rounded-full px-4 py-1.5 text-xs font-medium ${
              i === step
                ? 'bg-amber-500 text-zinc-950'
                : i < step
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="card mt-8">
        {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white">Select a branch</h2>
            <p className="mt-1 text-sm text-zinc-400">Tap a marker on the map or choose from the list</p>
            <div className="mt-6">
              <MapPicker
                branches={branches}
                selectedBranchId={selectedBranch?._id}
                onSelectBranch={setSelectedBranch}
              />
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {branches.map((b) => (
                <li key={b._id}>
                  <button
                    type="button"
                    onClick={() => setSelectedBranch(b)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedBranch?._id === b._id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <p className="font-medium text-white">{b.name}</p>
                    <p className="text-xs text-zinc-500">{b.address}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-white">Choose your master & service</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {masters.map((m) => (
                <button
                  key={m._id}
                  type="button"
                  onClick={() => {
                    setSelectedMaster(m);
                    setSelectedService(m.skills[0] || '');
                  }}
                  className={`rounded-xl border p-4 text-left transition ${
                    selectedMaster?._id === m._id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <p className="font-semibold text-white">{m.name}</p>
                  <p className="text-xs text-amber-400">★ {m.rating}</p>
                </button>
              ))}
            </div>
            {selectedMaster && (
              <div className="mt-6">
                <p className="label">Service</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMaster.skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setSelectedService(skill)}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        selectedService === skill
                          ? 'bg-amber-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {skill} — {SERVICE_PRICES[skill] || 800} KGS
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-white">Pick date & time</h2>
            <div className="mt-6">
              <label className="label" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="date"
                min={minDate()}
                className="input-field max-w-xs"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            {selectedDate && (
              <div className="mt-6">
                <p className="label">Available times</p>
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                ) : slots.length === 0 ? (
                  <p className="text-sm text-zinc-500">No slots available for this date.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                          selectedTime === slot
                            ? 'bg-amber-500 text-zinc-950'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-white">Confirm your booking</h2>
            <dl className="mt-6 space-y-3 rounded-xl bg-zinc-950/50 p-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Branch</dt>
                <dd className="text-white">{selectedBranch?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Master</dt>
                <dd className="text-white">{selectedMaster?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Service</dt>
                <dd className="text-white">{selectedService}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">When</dt>
                <dd className="text-white">
                  {selectedDate} at {selectedTime}
                </dd>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-3">
                <dt className="font-medium text-zinc-400">Total</dt>
                <dd className="font-bold text-amber-400">{price} KGS</dd>
              </div>
            </dl>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="clientName">
                  Your name
                </label>
                <input
                  id="clientName"
                  className="input-field"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="clientPhone">
                  Phone
                </label>
                <input
                  id="clientPhone"
                  className="input-field"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+996 ..."
                  required
                />
              </div>
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              Earn 5% loyalty cashback when your visit is marked completed (registered clients only).
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          {step < 3 ? (
            <button type="button" className="btn-primary" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={handleSubmit} disabled={!canNext() || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
