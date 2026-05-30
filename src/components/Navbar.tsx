import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="bg-bordo-900 text-white font-body">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.jfif" alt="Logo" className="h-8 w-8 rounded object-cover" />
          <span className="font-title text-lg font-bold tracking-tight">Estacionar Salta</span>
        </Link>
        <ul className="flex items-center gap-4 text-sm font-medium">
          {isAuthenticated && user?.role === 'permisionario' && (
            <li>
              <Link
                to="/permisionario"
                className={`transition-colors hover:text-bordo-100 ${
                  location.pathname === '/permisionario' ? 'text-white underline underline-offset-4' : 'text-white/80'
                }`}
              >
                Permisionario
              </Link>
            </li>
          )}
          <li>
            <Link
              to="/consultar"
              className={`transition-colors hover:text-bordo-100 ${
                location.pathname === '/consultar' ? 'text-white underline underline-offset-4' : 'text-white/80'
              }`}
            >
              Consultar
            </Link>
          </li>
          {isAuthenticated && user?.role === 'municipal' && (
            <li>
              <Link
                to="/dashboard"
                className={`transition-colors hover:text-bordo-100 ${
                  location.pathname === '/dashboard' ? 'text-white underline underline-offset-4' : 'text-white/80'
                }`}
              >
                Dashboard
              </Link>
            </li>
          )}
          {isAuthenticated ? (
            <li className="flex items-center gap-3 ml-2 pl-3 border-l border-white/30">
              <span className="text-xs text-white/70">{user?.nombre}</span>
              <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs transition-colors">
                Salir
              </button>
            </li>
          ) : (
            <li>
              <Link
                to="/login"
                className={`bg-bordo-700 hover:bg-bordo-500 px-4 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/login' ? 'ring-2 ring-white' : ''
                }`}
              >
                Ingresar
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
