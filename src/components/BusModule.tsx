import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BusSchedule, CalendarSettings } from '../lib/types';
import { getDayType } from '../lib/calendar';
import { formatTimeUntil, formatTime } from '../lib/timeFormat';
import { getPolishDate, getPolishDateString } from '../lib/polishTime';
import { parseSymbols, getSymbolDescription } from '../lib/courseLegend';
import { shouldShowBus, getNoCoursesMessage } from '../lib/busFiltering';
import { submitDelayReport, cleanupOldReports, scheduleMidnightCleanup } from '../lib/delayReports';
import { Toast } from './Toast';
import { Bus, AlertCircle, Clock, MapPin, Info, ChevronDown, Search } from 'lucide-react';

interface BusScheduleWithReports extends BusSchedule {
  reportCount: number;
}

interface BusWithReports extends BusScheduleWithReports {
  minutesUntil: number;
  departureMinutes: number;
  isFromTomorrow?: boolean;
}

export function BusModule() {
  const [schedules, setSchedules] = useState<BusScheduleWithReports[]>([]);
  const [currentTime, setCurrentTime] = useState(getPolishDate());
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings | undefined>(undefined);
  const [showAllBuses, setShowAllBuses] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    cleanupOldReports();
    scheduleMidnightCleanup();
    loadSchedules();
    loadCalendarSettings();

    const timer = setInterval(() => setCurrentTime(getPolishDate()), 1000);
    const cleanupTimer = setInterval(() => {
      cleanupOldReports();
      loadSchedules();
    }, 1 * 60 * 1000);

    return () => {
      clearInterval(timer);
      clearInterval(cleanupTimer);
    };
  }, []);

  async function loadSchedules() {
    // WYMUŚ CAŁKOWITE WYCZYSZCZENIE STANU

    try {
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('bus_schedules')
        .select('*')
        .order('departure_time');

      if (schedulesError) {
        console.error('Błąd pobierania rozkładu autobusów:', schedulesError);
        return;
      }

      const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data: reportsData, error: reportsError } = await supabase
        .from('bus_delay_reports')
        .select('bus_schedule_id')
        .gte('reported_at', sixtyMinutesAgo);

      if (reportsError) {
        console.error('❌ Błąd pobierania zgłoszeń opóźnień:', reportsError);
      }

      if (schedulesData) {
        const reportCounts = new Map<string, number>();
        reportsData?.forEach(report => {
          const currentCount = reportCounts.get(report.bus_schedule_id) || 0;
          reportCounts.set(report.bus_schedule_id, currentCount + 1);
        });

        const combined = schedulesData.map(schedule => ({
          ...schedule,
          reportCount: reportCounts.get(schedule.id) || 0,
        }));
        setSchedules(combined);
      }
    } catch (error) {
      console.error('❌ Nieoczekiwany błąd:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCalendarSettings() {
    try {
      const { data } = await supabase
        .from('calendar_settings')
        .select('*')
        .maybeSingle();

      if (data) {
        setCalendarSettings(data);
      }
    } catch (error) {
      console.error('Error loading calendar settings:', error);
    }
  }

  // Ta funkcja już nie jest potrzebna - używamy shouldShowBus zamiast niej

  function getMinutesUntil(departureTime: string, allowNegative = false): number {
    const now = new Date();
    const [hours, minutes] = departureTime.split(':').map(Number);

    const departure = new Date();
    departure.setHours(hours, minutes, 0, 0);

    const diffMinutes = Math.floor((departure.getTime() - now.getTime()) / (1000 * 60));

    // For past times, either return negative value or add a day
    if (diffMinutes < 0 && !allowNegative) {
      return diffMinutes + 1440; // Add 24 hours for tomorrow
    }

    return diffMinutes;
  }

  function getNextDepartures(now: Date, showAll: boolean, query: string): {
    departures: BusWithReports[];
    isTomorrow: boolean;
    todayRemainingCount: number;
    tomorrowAvailableCount: number;
    hasOnlyTomorrow: boolean;
    isFiltered: boolean;
  } {
    const DISPLAY_COUNT = 7;
    const PAST_WINDOW_MINUTES = 30;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const normalizedQuery = query.toLowerCase().trim();
    const isSearchActive = normalizedQuery.length > 0;

    function matchesSearch(schedule: BusSchedule): boolean {
      if (!isSearchActive) return true;
      const destination = schedule.destination.toLowerCase();
      const via = (schedule.via || '').toLowerCase();
      return destination.includes(normalizedQuery) || via.includes(normalizedQuery);
    }

    // KROK 1: Oblicz minutesUntil dla wszystkich autobusów z DZISIAJ
    const todayBuses = schedules
      .filter(s => {
        // ZAWSZE sprawdzaj dzień (czy autobus kursuje dziś)
        if (s.is_cancelled) return true;
        const filterResult = shouldShowBus(s, now, calendarSettings);
        if (!filterResult.shouldShow) return false;

        // DODATKOWO sprawdź wyszukiwanie
        return matchesSearch(s);
      })
      .map(schedule => {
        const [hours, minutes] = schedule.departure_time.split(':').map(Number);
        const departureMinutes = hours * 60 + minutes;
        const minutesUntil = departureMinutes - nowMinutes;

        return {
          ...schedule,
          minutesUntil,
          departureMinutes
        };
      });

    // KROK 2: Sortuj wszystkie autobusy po czasie wyjazdu
    todayBuses.sort((a, b) => a.departureMinutes - b.departureMinutes);

    // KROK 3: Gdy NIE pokazujemy wszystkich, filtruj do okna czasowego
    const validTodayBuses = todayBuses.filter(
      bus => bus.minutesUntil >= -PAST_WINDOW_MINUTES
    );

    // Przygotuj autobusy z JUTRA
    const tomorrow = getPolishDate();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowBuses = schedules
      .filter(s => {
        // ZAWSZE sprawdzaj dzień (czy autobus kursuje jutro)
        if (s.is_cancelled) return true;
        const filterResult = shouldShowBus(s, tomorrow, calendarSettings);
        if (!filterResult.shouldShow) return false;

        // DODATKOWO sprawdź wyszukiwanie
        return matchesSearch(s);
      })
      .map(schedule => {
        const [hours, minutes] = schedule.departure_time.split(':').map(Number);
        const departureMinutes = hours * 60 + minutes;
        const minutesUntil = 1440 - nowMinutes + departureMinutes;

        return {
          ...schedule,
          minutesUntil,
          departureMinutes,
          isFromTomorrow: true
        };
      })
      .sort((a, b) => a.departureMinutes - b.departureMinutes);

    // LOGIKA WYŚWIETLANIA
    let displayList: BusWithReports[];
    let isTomorrow = false;
    let todayRemainingCount = 0;
    let hasOnlyTomorrow = false;

    if (showAll || isSearchActive) {
      // Pokaż wszystko: WSZYSTKIE dzisiejskie + jutrzejsze (bez duplikatów)
      // Usuń duplikaty - gdy ten sam autobus jest dziś i jutro, pokaż tylko dzisiejszy
      const todayIds = new Set(validTodayBuses.map(b => b.id));
      const uniqueTomorrowBuses = tomorrowBuses.filter(b => !todayIds.has(b.id));
      displayList = [...validTodayBuses, ...uniqueTomorrowBuses];
      todayRemainingCount = 0;
    } else {
      // NOWA LOGIKA: max 3 ostatnie + reszta nadchodzące = 7 łącznie

      // Rozdziel na przeszłe i przyszłe (w oknie czasowym)
      const pastBuses = validTodayBuses.filter(bus => bus.minutesUntil < 0);
      const futureBuses = validTodayBuses.filter(bus => bus.minutesUntil >= 0);

      // Weź maksymalnie 3 ostatnie (najświeższe) z przeszłych
      const recentPast = pastBuses.slice(-3);

      // Oblicz ile potrzebujemy przyszłych kursów
      const remainingSlots = DISPLAY_COUNT - recentPast.length;

      // Weź odpowiednią ilość nadchodzących
      const upcomingBuses = futureBuses.slice(0, remainingSlots);

      // Połącz i posortuj chronologicznie
      const todayForDisplay = [...recentPast, ...upcomingBuses].sort(
        (a, b) => a.departureMinutes - b.departureMinutes
      );

      // Oblicz ile kursów zostało ukrytych (tylko przyszłe)
      todayRemainingCount = Math.max(0, futureBuses.length - upcomingBuses.length);

      // Jeśli brakuje do 7, weź z jutra (bez duplikatów)
      if (todayForDisplay.length < DISPLAY_COUNT) {
        const neededFromTomorrow = DISPLAY_COUNT - todayForDisplay.length;
        // Usuń duplikaty - nie pokazuj jutrzejszych jeśli są już dzisiaj
        const todayIds = new Set(todayForDisplay.map(b => b.id));
        const uniqueTomorrowBuses = tomorrowBuses.filter(b => !todayIds.has(b.id));
        const tomorrowForDisplay = uniqueTomorrowBuses.slice(0, neededFromTomorrow);

        isTomorrow = todayForDisplay.length === 0 && tomorrowForDisplay.length > 0;
        hasOnlyTomorrow = todayForDisplay.length === 0 && uniqueTomorrowBuses.length > 0;
        displayList = [...todayForDisplay, ...tomorrowForDisplay];
      } else {
        displayList = todayForDisplay;
      }
    }

    return {
      departures: displayList,
      isTomorrow,
      todayRemainingCount,
      tomorrowAvailableCount: tomorrowBuses.length,
      hasOnlyTomorrow,
      isFiltered: isSearchActive
    };
  }

  async function reportIssue(scheduleId: string) {
    try {
      const result = await submitDelayReport(scheduleId);

      setToastMessage(result.message);
      setShowToast(true);

      if (result.success) {
        await loadSchedules();
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      setToastMessage('Wystąpił błąd podczas zgłaszania opóźnienia');
      setShowToast(true);
    }
  }

  function handleReportClick(scheduleId: string, departureTime: string, minutesUntil: number) {
    if (minutesUntil > 0) {
      setToastMessage(`Zgłoszenie opóźnienia możliwe od godziny ${formatTime(departureTime)}`);
      setShowToast(true);
      return;
    }

    reportIssue(scheduleId);
  }

  function getReportStatus(reportCount: number): {
    borderColor: string;
    message: string;
    showMessage: boolean;
    showPulse: boolean;
  } | null {
    if (reportCount === 0) return null;

    if (reportCount >= 3) {
      return {
        borderColor: 'border-red-400',
        message: `⚠️ Potwierdzone opóźnienie (${reportCount})`,
        showMessage: true,
        showPulse: true,
      };
    }

    if (reportCount >= 1) {
      return {
        borderColor: 'border-yellow-400',
        message: `⚠️ Możliwe opóźnienie (${reportCount})`,
        showMessage: true,
        showPulse: false,
      };
    }

    return null;
  }

  const {
    departures: nextDepartures,
    isTomorrow,
    todayRemainingCount,
    tomorrowAvailableCount,
    hasOnlyTomorrow,
    isFiltered
  } = getNextDepartures(currentTime, showAllBuses, searchQuery);

  const [showLegend, setShowLegend] = useState(false);

  // Collect all used symbols (only from symbols field, not days_filter)
  const allUsedSymbols = Array.from(
    new Set(
      nextDepartures
        .filter(d => d.symbols)
        .flatMap(d => parseSymbols(d.symbols!))
    )
  ).sort();

  const infoMessage = getNoCoursesMessage(currentTime, calendarSettings);

  // Określ tekst przycisku rozwijania/zwijania
  const totalAvailableBuses = schedules.filter(s => {
    const today = getPolishDate();
    const filterResult = shouldShowBus(s, today, calendarSettings);
    return filterResult.shouldShow || s.is_cancelled;
  }).length + (tomorrowAvailableCount || 0);

  const hasMoreBuses = todayRemainingCount > 0 || (hasOnlyTomorrow && tomorrowAvailableCount > 0) || totalAvailableBuses > nextDepartures.length;
  const shouldShowToggleButton = !isFiltered && (hasMoreBuses || showAllBuses);
  const toggleButtonText = showAllBuses
    ? 'Zwiń listę'
    : todayRemainingCount > 0
    ? `Pokaż pozostałe autobusy na dziś (${todayRemainingCount})`
    : 'Pokaż wszystkie kursy';

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="text-sm text-blue-600 mb-2">⏳ Ładowanie danych z bazy...</div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Bus className="w-6 h-6 text-blue-600" />
          Odjazdy PKS – Grójec (Dworzec Laskowa)
        </h2>

        {loading && (
          <div className="mb-4">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Reset showAllBuses gdy zaczynamy wyszukiwać
              if (e.target.value.trim().length > 0 && showAllBuses) {
                setShowAllBuses(false);
              }
            }}
            placeholder="Dokąd chcesz jechać?"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowAllBuses(false); // Wróć do początkowego stanu 7 autobusów
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Wyczyść wyszukiwanie"
            >
              ✕
            </button>
          )}
        </div>

        {infoMessage && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800 font-medium">
              {infoMessage}
            </p>
          </div>
        )}

        {isTomorrow && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800 font-medium">
              Brak kursów na dziś. Najbliższe jutro rano:
            </p>
          </div>
        )}

        {searchQuery.trim() && nextDepartures.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Bus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-1">
              Nie znaleziono kursów
            </p>
            <p className="text-sm text-gray-500">
              Brak połączeń do miejscowości "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {nextDepartures.map((schedule, index) => {
            const minutesUntil = schedule.minutesUntil;
            const reportStatus = getReportStatus(schedule.reportCount);
            const isPast = minutesUntil < 0;
            const isArchival = minutesUntil < -30;
            const isNow = minutesUntil >= 0 && minutesUntil <= 5;
            const isTomorrowBus = schedule.isFromTomorrow === true;
            const hasReports = schedule.reportCount > 0;

            const canReport = !schedule.is_cancelled && !isTomorrowBus && minutesUntil <= 0 && minutesUntil >= -30;

            return (
              <div
                key={schedule.id}
                className={`rounded-lg px-3 py-2 transition-all border ${
                  schedule.is_cancelled
                    ? 'bg-gray-50 border-gray-300 opacity-60'
                    : isArchival
                    ? 'bg-gray-50 border-gray-200 opacity-50'
                    : hasReports
                    ? `border-gray-200 border-l-4 border-l-amber-500 bg-amber-50/20 ${isPast ? 'opacity-60' : ''}`
                    : isPast
                    ? 'bg-white border-gray-200 opacity-60'
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* First Row: Time | Route + Destination | Report Button */}
                <div className="flex items-center justify-between gap-3 mb-1">
                  {/* Time with optional pulse */}
                  <div className="flex-shrink-0 relative">
                    {schedule.is_cancelled ? (
                      <div className="text-sm text-red-600 font-bold line-through">
                        {formatTime(schedule.departure_time)}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="text-lg font-bold text-gray-900 leading-none">
                          {formatTime(schedule.departure_time)}
                        </div>
                        {reportStatus?.showPulse && (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Route Type & Destination */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                          schedule.route_type === 'PKS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {schedule.route_type}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {schedule.destination}
                      </span>
                    </div>
                    {schedule.via && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500 line-clamp-2">
                          {schedule.via}
                        </span>
                      </div>
                    )}
                    {schedule.symbols && (
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {/* Wyświetl tylko symbole z rozkładu (bez days_filter) */}
                        {parseSymbols(schedule.symbols).map(symbol => {
                          const description = getSymbolDescription(symbol);
                          return (
                            <span
                              key={symbol}
                              title={description}
                              className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded text-[11px] font-semibold cursor-help"
                            >
                              {symbol}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {canReport && (
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleReportClick(schedule.id, schedule.departure_time, minutesUntil)}
                        title="Zgłoś opóźnienie autobusu"
                        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all text-orange-500 hover:bg-orange-50 hover:text-orange-700 active:scale-95 cursor-pointer"
                      >
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-5 h-5" />
                          {hasReports && (
                            <span className="text-[10px] font-bold">
                              ({schedule.reportCount})
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] font-bold whitespace-nowrap leading-tight">
                          Zgłoś opóźnienie
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Second Row: Countdown first, then Status Messages */}
                {!schedule.is_cancelled && (
                  <div className="flex items-center gap-2 text-xs">
                    {/* Clock icon + countdown */}
                    <div className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {isTomorrowBus ? (
                        <span className="text-blue-600">
                          Jutro o {formatTime(schedule.departure_time)}
                        </span>
                      ) : isArchival ? (
                        <span className="text-gray-400">
                          Kurs archiwalny
                        </span>
                      ) : isPast ? (
                        <span className="text-gray-500">
                          {Math.abs(minutesUntil)} min temu
                        </span>
                      ) : isNow ? (
                        <span className="text-orange-600 font-bold animate-pulse">
                          TERAZ
                        </span>
                      ) : minutesUntil >= 60 ? (
                        <span className="text-green-600">
                          {(() => {
                            const hours = Math.floor(minutesUntil / 60);
                            const mins = minutesUntil % 60;
                            if (mins === 0) return `za ${hours} godz`;
                            return `za ${hours} godz ${mins} min`;
                          })()}
                        </span>
                      ) : (
                        <span className="text-green-600">
                          za {minutesUntil} min
                        </span>
                      )}
                    </div>
                    {/* Status zgłoszeń - dla WSZYSTKICH kursów z raportami */}
                    {hasReports && reportStatus?.showMessage && !isArchival && (
                      <span className={`font-semibold ${
                        reportStatus.showPulse ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {reportStatus.message}
                      </span>
                    )}
                  </div>
                )}

                {schedule.is_cancelled && (
                  <div className="text-xs text-red-600 font-semibold">
                    ODWOŁANY
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}

        {shouldShowToggleButton && (
            <button
              onClick={() => setShowAllBuses(!showAllBuses)}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-1"
            >
              <span>{toggleButtonText}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showAllBuses ? 'rotate-180' : ''}`} />
            </button>
          )}

        {allUsedSymbols.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Info className="w-4 h-4" />
              Legenda symboli kursowania
              <span className="text-xs text-gray-500">
                ({showLegend ? 'ukryj' : 'pokaż'})
              </span>
            </button>

            {showLegend && (
              <div className="mt-3 space-y-2">
                {allUsedSymbols.map(symbol => (
                  <div key={symbol} className="flex items-start gap-2 text-xs">
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded font-medium flex-shrink-0">
                      {symbol}
                    </span>
                    <span className="text-gray-600 leading-relaxed">
                      {getSymbolDescription(symbol)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
