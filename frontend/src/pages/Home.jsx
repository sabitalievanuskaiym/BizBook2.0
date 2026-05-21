import { Link } from 'react-router-dom';
import { Calendar, MapPin, BarChart3, Bell, Star, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Multi-Branch Network',
    description: 'Manage every location across Bishkek from one unified platform with live map-based branch selection.',
  },
  {
    icon: Calendar,
    title: 'Smart Online Booking',
    description: 'Clients book their favorite master in minutes with real-time availability and instant confirmations.',
  },
  {
    icon: Star,
    title: 'Loyalty Cashback',
    description: 'Automatic 5% bonus balance on every completed visit keeps clients coming back to your chairs.',
  },
  {
    icon: Bell,
    title: 'Telegram Alerts',
    description: 'Managers receive instant booking and cancellation notifications directly in Telegram.',
  },
  {
    icon: BarChart3,
    title: 'Executive Analytics',
    description: 'Revenue dashboards, branch performance, and master KPIs for data-driven growth.',
  },
];

const Home = () => {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-zinc-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-zinc-950 to-zinc-950" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-medium uppercase tracking-wider text-amber-300">
            Premium Barber Networks
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Run your barber empire with{' '}
            <span className="bg-gradient-to-r from-amber-300 to-amber-600 bg-clip-text text-transparent">
              BizBook
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-400">
            The all-in-one management and booking platform for barber shop networks. Schedule masters,
            delight clients, and grow revenue across every branch.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/book" className="btn-primary text-base">
              Book an Appointment
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/register" className="btn-secondary text-base">
              Join the Network
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-white">Built for modern barber brands</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">
          Multi-tenant architecture keeps every network isolated while delivering a luxury client experience.
        </p>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <article key={title} className="card group transition hover:border-amber-500/40">
              <span className="mb-4 inline-flex rounded-xl bg-amber-500/15 p-3 text-amber-400 transition group-hover:bg-amber-500/25">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-800 bg-zinc-900/40">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white">Ready for your next cut?</h2>
          <p className="mt-2 text-zinc-400">Pick a branch on the map and reserve your slot in under a minute.</p>
          <Link to="/book" className="btn-primary mt-8">
            Book an Appointment
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
