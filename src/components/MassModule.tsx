import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Parish, MassSchedule, MassScheduleException } from '../lib/types';
import { getDayType, formatDate } from '../lib/calendar';
import { formatTime } from '../lib/timeFormat';
import { getPolishDate, getPolishDateString } from '../lib/polishTime';
import { Church, MapPin, Calendar } from 'lucide-react';

interface MassWithParish extends MassSchedule {
  parish?: Parish;
}

interface ExceptionWithParish extends MassScheduleException {
  parish?: Parish;
}

type MassStatus = 'in_progress' | 'past' | 'next' | 'upcoming';

interface MassTimeStatus {
  mass: MassWithParish | ExceptionWithParish;
  status: MassStatus;
  minutesUntil: number;
}

interface ParishWithMasses {
  parish: Parish;
  masses: MassTimeStatus[];
  eventName?: string;
  isException: boolean;
}

export function MassModule() {
  const [masses, setMasses] = useState<MassWithParish[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionWithParish[]>([]);
  const [tomorrowExceptions, setTomorrowExceptions] = useState<ExceptionWithParish[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [currentTime, setCurrentTime] = useState(getPolishDate());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(getPolishDate()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function loadData() {
    try {
      const { data: parishesData } = await supabase
        .from('parishes')
        .select('*');

      const { data: massesData } = await supabase
        .from('mass_schedules')
        .select('*')
        .order('time');

      const today = getPolishDateString(getPolishDate());
      const { data: exceptionsData } = await supabase
        .from('mass_schedule_exceptions')
        .select('*')
        .eq('date', today)
        .order('time');

      const tomorrow = new Date(getPolishDate());
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = getPolishDateString(tomorrow);
      const { data: tomorrowExceptionsData } = await supabase
        .from('mass_schedule_exceptions')
        .select('*')
        .eq('date', tomorrowString)
        .order('time');

      if (parishesData && massesData) {
        const sortedParishes = parishesData.sort((a, b) => {
          if (a.name.includes('Najświętszego Serca') || a.address.includes('Worów')) return 1;
          if (b.name.includes('Najświętszego Serca') || b.address.includes('Worów')) return -1;
          return a.name.localeCompare(b.name);
        });

        setParishes(sortedParishes);
        const combined = massesData.map(mass => ({
          ...mass,
          parish: parishesData.find(p => p.id === mass.parish_id),
        }));
        setMasses(combined);

        if (exceptionsData) {
          const combinedExceptions = exceptionsData.map(exc => ({
            ...exc,
            parish: parishesData.find(p => p.id === exc.parish_id),
          }));
          setExceptions(combinedExceptions);
        }

        if (tomorrowExceptionsData) {
          const combinedTomorrowExceptions = tomorrowExceptionsData.map(exc => ({
            ...exc,
            parish: parishesData.find(p => p.id === exc.parish_id),
          }));
          setTomorrowExceptions(combinedTomorrowExceptions);
        }
      }
    } catch (error) {
      console.error('Error loading masses:', error);
    } finally {
      setLoading(false);
    }
  }

  function getMassStatus(time: string, durationMinutes: number): {
    status: MassStatus;
    minutesUntil: number;
  } {
    const [hours, minutes] = time.split(':').map(Number);
    const massTime = new Date(currentTime);
    massTime.setHours(hours, minutes, 0, 0);

    const minutesSinceStart = Math.floor(
      (currentTime.getTime() - massTime.getTime()) / (1000 * 60)
    );

    if (minutesSinceStart >= 0 && minutesSinceStart < durationMinutes) {
      return { status: 'in_progress', minutesUntil: 0 };
    }

    if (minutesSinceStart >= durationMinutes) {
      return { status: 'past', minutesUntil: 0 };
    }

    const minutesUntil = Math.abs(minutesSinceStart);
    return { status: 'upcoming', minutesUntil };
  }

  function getNextDayFirstMass(parishId: string): string | null {
    const tomorrow = new Date(getPolishDate());
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDayType = getDayType(tomorrow);

    const parishTomorrowExceptions = tomorrowExceptions.filter(exc => exc.parish_id === parishId);

    if (parishTomorrowExceptions.length > 0) {
      const sorted = parishTomorrowExceptions.sort((a, b) => a.time.localeCompare(b.time));
      return sorted[0].time;
    }

    const regularTomorrowMasses = masses.filter(
      m => m.parish_id === parishId && m.day_type === tomorrowDayType
    );

    if (regularTomorrowMasses.length > 0) {
      const sorted = regularTomorrowMasses.sort((a, b) => a.time.localeCompare(b.time));
      return sorted[0].time;
    }

    return null;
  }

  function getParishesWithMasses(): ParishWithMasses[] {
    const result: ParishWithMasses[] = [];
    const currentDayType = getDayType();

    parishes.forEach(parish => {
      const parishExceptions = exceptions.filter(exc => exc.parish_id === parish.id);

      let massesToUse: (MassWithParish | ExceptionWithParish)[] = [];
      let isException = false;
      let eventName: string | undefined;

      if (parishExceptions.length > 0) {
        massesToUse = parishExceptions;
        isException = true;
        eventName = parishExceptions[0].event_name || undefined;
      } else {
        const regularMasses = masses.filter(
          m => m.parish_id === parish.id && m.day_type === currentDayType
        );
        massesToUse = regularMasses;
        isException = false;
      }

      const sortedMasses = massesToUse.sort((a, b) => a.time.localeCompare(b.time));

      const massesWithStatus: MassTimeStatus[] = sortedMasses.map(mass => {
        const duration = 'duration_minutes' in mass ? mass.duration_minutes : 60;
        const { status, minutesUntil } = getMassStatus(mass.time, duration);
        return {
          mass,
          status,
          minutesUntil,
        };
      });

      const firstUpcomingIndex = massesWithStatus.findIndex(m => m.status === 'upcoming');
      if (firstUpcomingIndex !== -1) {
        massesWithStatus[firstUpcomingIndex].status = 'next';
      }

      result.push({
        parish,
        masses: massesWithStatus,
        eventName,
        isException
      });
    });

    return result;
  }

  const parishesWithMasses = getParishesWithMasses();

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

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Church className="w-6 h-6 text-purple-600" />
          Msze i Nabożeństwa
        </h2>
        <p className="text-sm text-gray-600 mt-1 ml-8">
          Dzisiaj: {formatDate(currentTime)}
        </p>
      </div>

      <div className="space-y-3">
        {parishesWithMasses.map(({ parish, masses, eventName, isException }) => (
          <div
            key={parish.id}
            className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
          >
            <div className="mb-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 text-base">
                  {parish.name}
                </h3>
                {isException && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full border border-blue-200 whitespace-nowrap">
                    <Calendar className="w-3 h-3" />
                    Grafik specjalny
                  </span>
                )}
              </div>
              {eventName && (
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                    <Calendar className="w-3.5 h-3.5" />
                    {eventName}
                  </span>
                </div>
              )}
              <a
                href={
                  parish.navigation_link ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parish.address || '')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-blue-600 text-xs rounded-full transition-all border border-gray-200 hover:border-blue-300 hover:shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{parish.address}</span>
              </a>
            </div>

            <div className="pt-3 border-t border-gray-100 mt-2">
              <p className="text-xs text-gray-500 mb-3">Godziny nabożeństw</p>
              {masses.length === 0 ? (
                <div className="text-center py-6 px-4">
                  <p className="text-sm text-gray-600 mb-2">Brak nabożeństw w dniu dzisiejszym</p>
                  {(() => {
                    const nextMassTime = getNextDayFirstMass(parish.id);
                    if (nextMassTime) {
                      return (
                        <p className="text-xs text-gray-500">
                          Najbliższe nabożeństwo: jutro o {formatTime(nextMassTime)}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {masses.map(({ mass, status }) => (
                    <div
                      key={mass.id}
                      className={`relative px-4 py-3 rounded-lg transition-all ${
                        status === 'past'
                          ? 'bg-gray-200 border border-gray-300'
                          : status === 'in_progress'
                          ? 'bg-purple-600 text-white shadow-lg animate-pulse border-2 border-purple-700'
                          : status === 'next'
                          ? 'bg-purple-50 border-2 border-green-500 shadow-sm'
                          : 'bg-purple-50 border border-purple-200'
                      }`}
                    >
                      {status === 'next' && (
                        <div className="absolute -top-2 -right-2 bg-green-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow-md">
                          Najbliższe
                        </div>
                      )}
                      {status === 'in_progress' && (
                        <div className="absolute -top-2 -right-2 bg-purple-800 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow-md">
                          W trakcie
                        </div>
                      )}
                      {'title' in mass && mass.title && (
                        <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${
                          status === 'past'
                            ? 'text-gray-700'
                            : status === 'in_progress'
                            ? 'text-purple-200'
                            : 'text-purple-700'
                        }`}>
                          {mass.title}
                        </div>
                      )}
                      <div className={`text-base font-bold ${
                        status === 'past'
                          ? 'text-gray-800 line-through'
                          : status === 'in_progress'
                          ? 'text-white'
                          : status === 'next'
                          ? 'text-purple-900'
                          : 'text-purple-900'
                      }`}>
                        {formatTime(mass.time)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
