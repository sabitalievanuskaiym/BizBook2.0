import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Scissors, LogOut, User, LayoutDashboard, Calendar, Shield } from 'lucide-react';
import { authApi, clearAuth, getStoredUser, isTokenValid, subscribeAuth } from '../utils/api';
import { useCallback, useEffect, useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => getStoredUser());

  const syncSession = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      setUser(null);
      return;
    }
    authApi
      .me()
      .then((data) => {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      })
      .catch(() => {
        setUser(getStoredUser());
      });
  }, []);

  useEffect(() => {
    syncSession();
  }, [location.pathname, syncSession]);

  useEffect(() => {
    return subscribeAuth(syncSession);
  }, [syncSession]);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-zinc-950">
            <Scissors className="h-5 w-5" />
          </span>
          <span>
            Biz<span className="text-amber-400">Book</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link to="/book" className="hidden text-sm text-zinc-400 transition hover:text-amber-400 sm:block">
            Book
          </Link>

          {!user && (
            <>
              <Link to="/login" className="btn-secondary px-4 py-2 text-sm">
                Log in
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                Sign up
              </Link>
            </>
          )}

          {user && user.role === 'client' && (
            <>
              <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 sm:gap-2 sm:px-3">
                <span className="hidden text-xs text-amber-200/80 sm:inline">Loyalty</span>
                <span className="text-xs font-bold text-amber-400 sm:text-sm">{user.bonusBalance ?? 0} KGS</span>
              </div>
              <Link to="/dashboard" className="flex items-center gap-1 text-sm text-zinc-300 hover:text-amber-400">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </>
          )}

          {user && user.role === 'master' && (
            <Link to="/staff" className="flex items-center gap-1 text-sm text-zinc-300 hover:text-amber-400">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Staff Portal</span>
            </Link>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-1 text-sm text-zinc-300 hover:text-amber-400">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {user && (
            <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
              <User className="h-4 w-4 text-zinc-500" />
              <span className="hidden max-w-[120px] truncate text-sm text-zinc-400 md:inline">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-red-400"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
