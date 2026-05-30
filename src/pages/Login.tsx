import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginPermisionario, loginMunicipal } from '../services/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [modo, setModo] = useState<'permisionario' | 'municipal'>('permisionario');
  const [legajo, setLegajo] = useState('');
  const [pin, setPin] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (modo === 'permisionario') {
      const user = loginPermisionario(legajo, pin);
      if (!user) {
        setError('Legajo o PIN incorrecto');
        return;
      }
      login(user);
      navigate('/permisionario');
    } else {
      const user = loginMunicipal(username, password);
      if (!user) {
        setError('Usuario o contraseña incorrectos');
        return;
      }
      login(user);
      navigate('/dashboard');
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-cream font-body flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg border border-bordo-100 p-8">
          <div className="text-center mb-6">
            <img src="/logo.jfif" alt="Estacionar Salta" className="h-16 w-16 rounded-xl mx-auto object-cover" />
            <h1 className="mt-3 font-title text-xl font-bold text-bordo-900">Estacionar Salta</h1>
            <p className="text-sm text-muted mt-1">Iniciar sesión</p>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setModo('permisionario')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                modo === 'permisionario' ? 'bg-white shadow text-bordo-900' : 'text-muted hover:text-dark'
              }`}
            >
              Permisionario
            </button>
            <button
              onClick={() => setModo('municipal')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                modo === 'municipal' ? 'bg-white shadow text-bordo-900' : 'text-muted hover:text-dark'
              }`}
            >
              Municipal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {modo === 'permisionario' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-dark/70">Legajo</label>
                  <input
                    type="text"
                    value={legajo}
                    onChange={(e) => setLegajo(e.target.value)}
                    placeholder="Ej: 001"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bordo-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark/70">PIN</label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Ingresá tu PIN"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bordo-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-muted">Demo: legajo 001, PIN 1234</p>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-dark/70">Usuario</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Usuario municipal"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bordo-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark/70">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bordo-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-muted">Demo: usuario admin, contraseña admin</p>
              </>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-bordo-900 text-white font-semibold py-3 rounded-lg hover:bg-bordo-700 transition-colors"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
