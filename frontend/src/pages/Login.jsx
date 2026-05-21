import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, setAuth } from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(form);
      setAuth({ token: data.token, user: data.user });
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'master') navigate('/staff');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-400">Sign in to your BizBook account</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          No account?{' '}
          <Link to="/register" className="font-medium text-amber-400 hover:text-amber-300">
            Create one
          </Link>
        </p>

        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-xs text-zinc-500">
          <p className="font-medium text-zinc-400">Demo accounts (elite-barbers)</p>
          <p className="mt-2">Admin: admin@elite-barbers.kg / admin123</p>
          <p>Master: azamat@elite-barbers.kg / master123</p>
          <p>Client: client@elite-barbers.kg / client123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
