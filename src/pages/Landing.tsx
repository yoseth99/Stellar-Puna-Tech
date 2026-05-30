import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Landing() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-cream font-body">
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <img src="/logo.jfif" alt="Estacionar Salta" className="h-20 w-20 rounded-2xl mx-auto object-cover shadow-md" />
        <h1 className="mt-4 font-title text-4xl md:text-5xl font-extrabold text-bordo-900 leading-tight">
          Estacionar Salta
        </h1>
        <p className="mt-3 text-lg text-dark/70 max-w-2xl mx-auto">
          Plataforma inteligente de trazabilidad urbana para el Sistema de Estacionamiento Medido de Salta.
          Rápida, transparente y auditable.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {isAuthenticated && user?.role === 'permisionario' ? (
            <Link
              to="/permisionario"
              className="block bg-white rounded-xl shadow-md border border-bordo-100 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-bordo-900 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white text-2xl font-bold">P</span>
              </div>
              <h2 className="mt-4 font-title font-bold text-lg text-bordo-900">Mi Panel</h2>
              <p className="mt-1 text-sm text-dark/60">
                Generar tickets y registrar cobros
              </p>
            </Link>
          ) : (
            <Link
              to="/login"
              className="block bg-white rounded-xl shadow-md border border-bordo-100 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-bordo-900 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white text-2xl font-bold">P</span>
              </div>
              <h2 className="mt-4 font-title font-bold text-lg text-bordo-900">Permisionario</h2>
              <p className="mt-1 text-sm text-dark/60">
                Ingresar para generar tickets y cobrar
              </p>
            </Link>
          )}

          <Link
            to="/consultar"
            className="block bg-white rounded-xl shadow-md border border-bordo-100 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 bg-bordo-700 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white text-2xl font-bold">C</span>
            </div>
            <h2 className="mt-4 font-title font-bold text-lg text-bordo-900">Consultar</h2>
            <p className="mt-1 text-sm text-dark/60">
              Ingresá tu patente y verificá tu estacionamiento
            </p>
          </Link>

          <Link
            to="/login"
            className="block bg-white rounded-xl shadow-md border border-bordo-100 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 bg-dark rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
            <h2 className="mt-4 font-title font-bold text-lg text-bordo-900">Municipio</h2>
            <p className="mt-1 text-sm text-dark/60">
              Dashboard de control y trazabilidad
            </p>
          </Link>
        </div>

        <div className="mt-14 p-6 bg-white rounded-xl border border-bordo-100 text-left max-w-3xl mx-auto">
          <h3 className="font-title font-bold text-lg text-bordo-900">Cumplimiento normativo automático</h3>
          <ul className="mt-3 space-y-2 text-sm text-dark/70">
            <li className="flex items-start gap-2">
              <span className="text-success font-bold mt-0.5">✓</span>
              Descuento del 20% en pagos digitales absorbido por la Municipalidad
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success font-bold mt-0.5">✓</span>
              Fraccionamiento cada 15 min a partir de la 2da hora
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success font-bold mt-0.5">✓</span>
              Bloqueo automático de cobros en horarios no permitidos
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success font-bold mt-0.5">✓</span>
              Cada transacción registrada en Stellar con hash verificable
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success font-bold mt-0.5">✓</span>
              Pago digital en menos de 15 segundos
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
