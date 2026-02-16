import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getVisitCount } from '../hooks/useVisitCounter';
import { Lock, Eye, Users, Pill, Trash2, Bus, Church, Calendar, AlertTriangle } from 'lucide-react';
import { PharmaciesAdmin } from './admin/PharmaciesAdmin';
import { BusesAdmin } from './admin/BusesAdmin';
import { WasteAdmin } from './admin/WasteAdmin';
import { MassesAdmin } from './admin/MassesAdmin';
import ExceptionsAdmin from './admin/ExceptionsAdmin';
import { CalendarControlAdmin } from './admin/CalendarControlAdmin';
import { EmergencyAlertsAdmin } from './admin/EmergencyAlertsAdmin';

const ADMIN_EMAIL = 'grojecnacito@gmail.com';

type AdminSection = 'dashboard' | 'pharmacies' | 'buses' | 'waste' | 'masses' | 'exceptions' | 'calendar' | 'alerts';

export function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [visitCount, setVisitCount] = useState(0);
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === ADMIN_EMAIL) {
        setIsAuthenticated(true);
        loadVisitCount();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadVisitCount() {
    const count = await getVisitCount();
    setVisitCount(count);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (email !== ADMIN_EMAIL) {
        setError('Brak uprawnień administratora');
        setIsLoading(false);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Nieprawidłowe dane logowania');
        } else {
          setError('Błąd logowania: ' + signInError.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user?.email === ADMIN_EMAIL) {
        setIsAuthenticated(true);
        loadVisitCount();
      } else {
        setError('Brak uprawnień administratora');
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Wystąpił błąd podczas logowania');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setEmail('');
      setPassword('');
      setError('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="animate-pulse">
            <div className="bg-blue-100 p-4 rounded-full inline-block mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600">Ładowanie...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Panel Administracyjny
          </h1>
          <p className="text-gray-600 text-center mb-6">Grójec na Cito</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="twoj-email@example.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hasło
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Wprowadź hasło"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel Administracyjny</h1>
            <p className="text-sm text-gray-600">Grójec na Cito</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Wyloguj
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeSection === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={<Eye className="w-8 h-8 text-blue-600" />}
                title="Liczba odwiedzin"
                value={visitCount.toLocaleString()}
                color="bg-blue-50"
              />
              <StatCard
                icon={<Users className="w-8 h-8 text-green-600" />}
                title="Status systemu"
                value="Online"
                color="bg-green-50"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Zarządzanie danymi</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminButton
                  title="Apteki"
                  description="Zarządzaj aptekami i godzinami otwarcia"
                  icon={<Pill className="w-6 h-6" />}
                  onClick={() => setActiveSection('pharmacies')}
                />
                <AdminButton
                  title="Odpady"
                  description="Harmonogramy odbioru odpadów"
                  icon={<Trash2 className="w-6 h-6" />}
                  onClick={() => setActiveSection('waste')}
                />
                <AdminButton
                  title="Autobusy"
                  description="Rozkład jazdy PKS i BUSY"
                  icon={<Bus className="w-6 h-6" />}
                  onClick={() => setActiveSection('buses')}
                />
                <AdminButton
                  title="Nabożeństwa"
                  description="Godziny mszy świętych"
                  icon={<Church className="w-6 h-6" />}
                  onClick={() => setActiveSection('masses')}
                />
                <AdminButton
                  title="Wyjątki - Msze"
                  description="Specjalne harmonogramy na konkretne daty"
                  icon={<Calendar className="w-6 h-6" />}
                  onClick={() => setActiveSection('exceptions')}
                />
                <AdminButton
                  title="Status Kalendarza"
                  description="Wymuś tryb świąteczny lub feryjny"
                  icon={<Calendar className="w-6 h-6" />}
                  onClick={() => setActiveSection('calendar')}
                />
                <AdminButton
                  title="Alerty awaryjne"
                  description="Komunikaty ostrzegawcze na stronie głównej"
                  icon={<AlertTriangle className="w-6 h-6" />}
                  onClick={() => setActiveSection('alerts')}
                />
              </div>
            </div>
          </>
        )}

        {activeSection !== 'dashboard' && (
          <div>
            <button
              onClick={() => setActiveSection('dashboard')}
              className="mb-4 text-sm text-blue-600 hover:text-blue-700 underline"
            >
              ← Powrót do dashboardu
            </button>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              {activeSection === 'pharmacies' && <PharmaciesAdmin />}
              {activeSection === 'buses' && <BusesAdmin />}
              {activeSection === 'waste' && <WasteAdmin />}
              {activeSection === 'masses' && <MassesAdmin />}
              {activeSection === 'exceptions' && <ExceptionsAdmin />}
              {activeSection === 'calendar' && <CalendarControlAdmin />}
              {activeSection === 'alerts' && <EmergencyAlertsAdmin />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className={`${color} w-16 h-16 rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function AdminButton({ title, description, icon, onClick }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-blue-600">{icon}</div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}
