import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Pharmacy, PharmacyHours } from '../lib/types';
import { getDayType } from '../lib/calendar';
import { formatTime } from '../lib/timeFormat';
import { getPolishDate } from '../lib/polishTime';
import { MapPin, Phone, Pill, ChevronDown } from 'lucide-react';

interface PharmacyWithHours extends Pharmacy {
  hours?: PharmacyHours[];
}

export function PharmacyModule() {
  const [pharmacies, setPharmacies] = useState<PharmacyWithHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllOpen, setShowAllOpen] = useState(false);

  useEffect(() => {
    loadPharmacies();
  }, []);

  async function loadPharmacies() {
    try {
      const { data: pharmaciesData } = await supabase
        .from('pharmacies')
        .select('*')
        .order('is_priority_duty', { ascending: false });

      const { data: hoursData } = await supabase
        .from('pharmacy_hours')
        .select('*');

      if (pharmaciesData && hoursData) {
        const combined = pharmaciesData.map(pharmacy => ({
          ...pharmacy,
          hours: hoursData.filter(h => h.pharmacy_id === pharmacy.id),
        }));
        setPharmacies(combined);
      }
    } catch (error) {
      console.error('Error loading pharmacies:', error);
    } finally {
      setLoading(false);
    }
  }

  function getPharmacyStatus(pharmacy: PharmacyWithHours): {
    isOpen: boolean;
    message: string;
    color: string;
    minutesUntilClose: number | null;
    closeTime: number | null;
  } {
    const now = getPolishDate();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const dayType = getDayType();

    // Apteka dyżurna 24/7
    if (pharmacy.is_priority_duty && (dayType === 'sunday' || dayType === 'holiday' || currentHour >= 21 || currentHour < 8)) {
      return {
        isOpen: true,
        message: 'DYŻUR CAŁODOBOWY',
        color: 'bg-green-500 animate-pulse',
        minutesUntilClose: null,
        closeTime: null,
      };
    }

    const isWeekday = !['saturday', 'sunday', 'holiday'].includes(dayType);
    const todayHours = pharmacy.hours?.find(h => h.day_type === dayType) || 
                       pharmacy.hours?.find(h => h.day_type === 'weekday' && isWeekday);

    if (!todayHours || todayHours.is_closed) {
      return {
        isOpen: false,
        message: 'Zamknięte',
        color: 'bg-gray-400',
        minutesUntilClose: null,
        closeTime: null,
      };
    }

    if (todayHours.open_time && todayHours.close_time) {
      const [openHour, openMinute] = todayHours.open_time.split(':').map(Number);
      const [closeHour, closeMinute] = todayHours.close_time.split(':').map(Number);

      const currentTime = currentHour * 60 + currentMinute;
      const openTime = openHour * 60 + openMinute;
      const closeTime = closeHour * 60 + closeMinute;

      if (currentTime >= openTime && currentTime < closeTime) {
        const minutesUntilClose = closeTime - currentTime;

        // Safe Window Logic
        if (minutesUntilClose < 15) {
          return {
            isOpen: false,
            message: 'Zamknięte / Koniec obsługi',
            color: 'bg-gray-400',
            minutesUntilClose,
            closeTime,
          };
        } else if (minutesUntilClose <= 30) {
          return {
            isOpen: true,
            message: `⚠️ Zamyka się wkrótce (o ${formatTime(todayHours.close_time)})`,
            color: 'bg-orange-500',
            minutesUntilClose,
            closeTime,
          };
        } else {
          return {
            isOpen: true,
            message: `Czynne do ${formatTime(todayHours.close_time)}`,
            color: 'bg-green-500',
            minutesUntilClose,
            closeTime,
          };
        }
      }
    }

    return {
      isOpen: false,
      message: 'Zamknięte',
      color: 'bg-gray-400',
      minutesUntilClose: null,
      closeTime: null,
    };
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const pharmaciesWithStatus = pharmacies.map(pharmacy => ({
    pharmacy,
    status: getPharmacyStatus(pharmacy),
  }));

  const dutyPharmacy = pharmaciesWithStatus.find(p => p.pharmacy.is_priority_duty);

  // Separate open pharmacies (excluding duty pharmacy)
  const otherOpen = pharmaciesWithStatus
    .filter(p => !p.pharmacy.is_priority_duty && p.status.isOpen)
    .sort((a, b) => {
      // Sort by close time (latest closing first)
      const closeA = a.status.closeTime ?? 0;
      const closeB = b.status.closeTime ?? 0;
      return closeB - closeA;
    });

  // All other pharmacies (closing soon <15min or already closed)
  const otherPharmacies = pharmaciesWithStatus.filter(
    p => !p.pharmacy.is_priority_duty && !p.status.isOpen
  );

  // Top 3 logic: Always show 3 pharmacies total (duty + open, or fill with closed if needed)
  const totalSlotsNeeded = 3;
  const slotsForOpen = dutyPharmacy ? (totalSlotsNeeded - 1) : totalSlotsNeeded;

  const topOpen = otherOpen.slice(0, slotsForOpen);
  const topOther = otherPharmacies.slice(0, Math.max(0, slotsForOpen - topOpen.length));

  const visiblePharmacies = showAllOpen
    ? [...otherOpen, ...otherPharmacies]
    : [...topOpen, ...topOther];

  const remainingCount = otherOpen.length + otherPharmacies.length - visiblePharmacies.length;

  const renderPharmacyCard = (pharmacy: Pharmacy, status: ReturnType<typeof getPharmacyStatus>) => (
    <div
      key={pharmacy.id}
      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">{pharmacy.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {pharmacy.is_priority_duty && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                ⭐ Apteka dyżurna 2026
              </span>
            )}
            {pharmacy.info_note && (
              <span className="text-xs text-gray-500 italic">
                • {pharmacy.info_note}
              </span>
            )}
          </div>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-white text-xs font-semibold whitespace-nowrap ${status.color}`}
        >
          {status.message}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.address + ' Grójec')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group flex-1 min-w-0"
        >
          <MapPin className="w-4 h-4 text-gray-500 group-hover:text-blue-600 flex-shrink-0" />
          <span className="text-sm text-gray-700 group-hover:text-blue-600 truncate">{pharmacy.address}</span>
        </a>

        {pharmacy.phone && (
          <a
            href={`tel:${pharmacy.phone}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors flex-shrink-0 shadow-sm"
            title={`Zadzwoń: ${pharmacy.phone}`}
          >
            <Phone className="w-4 h-4 text-white" />
            <span className="text-sm text-white font-semibold">Zadzwoń</span>
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Pill className="w-6 h-6 text-green-600" />
        Apteki w Grójcu
      </h2>

      <div className="space-y-3">
        {dutyPharmacy && renderPharmacyCard(dutyPharmacy.pharmacy, dutyPharmacy.status)}

        {visiblePharmacies.map(({ pharmacy, status }) => renderPharmacyCard(pharmacy, status))}

        {(remainingCount > 0 || showAllOpen) && (
          <button
            onClick={() => setShowAllOpen(!showAllOpen)}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-1"
          >
            <span>
              {showAllOpen ? 'Zwiń listę' : `Pokaż wszystkie apteki w Grójcu (${remainingCount})`}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showAllOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {pharmacies.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Brak danych o aptekach. Skontaktuj się z administratorem.
        </p>
      )}
    </div>
  );
}
