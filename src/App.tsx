import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { EmergencyBanner } from './components/EmergencyBanner';
import { SmartBanner } from './components/SmartBanner';
import { PharmacyModule } from './components/PharmacyModule';
import { WasteModule } from './components/WasteModule';
import { BusModule } from './components/BusModule';
import { MassModule } from './components/MassModule';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { CookieBanner } from './components/CookieBanner';
import { SEO, SEO_CONFIGS } from './components/SEO';
import { useVisitCounter } from './hooks/useVisitCounter';
import { useAnalytics } from './hooks/useAnalytics';

function App() {
  const [currentRoute, setCurrentRoute] = useState('home');

  useVisitCounter();
  useAnalytics(currentRoute);

  useEffect(() => {
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  function checkRoute() {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentRoute('admin');
    } else if (path === '/privacy') {
      setCurrentRoute('privacy');
    } else {
      setCurrentRoute('home');
    }
  }

  if (currentRoute === 'admin') {
    return (
      <>
        <SEO {...SEO_CONFIGS.admin} />
        <AdminPanel />
      </>
    );
  }

  if (currentRoute === 'privacy') {
    return (
      <>
        <SEO {...SEO_CONFIGS.privacy} />
        <PrivacyPolicy />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO {...SEO_CONFIGS.home} />
      <EmergencyBanner />
      <SmartBanner />
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div id="autobusy">
            <BusModule key="bus-module-supabase-only" />
          </div>
          <div id="apteki">
            <PharmacyModule />
          </div>
          <div id="odpady">
            <WasteModule />
          </div>
          <div id="nabożeństwa">
            <MassModule />
          </div>
        </div>
      </main>

      <Footer />
      <CookieBanner />
    </div>
  );
}

export default App;
