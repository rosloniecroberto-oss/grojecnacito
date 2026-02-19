import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { WasteArea, WasteSchedule } from '../lib/types';
import { getDaysUntil, isToday, isTomorrow } from '../lib/calendar';
import { getPolishDate, getPolishDateString } from '../lib/polishTime';
import { Trash2, Search, ChevronDown, ChevronUp, Trash, Recycle, FileText, Wine, Trees, Flame, Shirt } from 'lucide-react';

function getWasteIcon(wasteType: string) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    mixed: Trash,
    plastic: Recycle,
    paper: FileText,
    glass: Wine,
    green: Trees,
    christmas_trees: Trees,
    bulky: Trash2,
    ash: Flame,
    textiles: Shirt,
  };
  return iconMap[wasteType] || Trash2;
}

const WASTE_COLORS: Record<string, {
  bg: string;
  text: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  heroBg: string;
  heroText: string;
}> = {
  mixed: {
    bg: 'bg-zinc-100',
    text: 'text-zinc-900',
    label: 'Zmieszane',
    description: 'odpady niesegregowane',
    icon: <Trash className="w-16 h-16" />,
    heroBg: 'bg-gradient-to-br from-zinc-800 to-zinc-950',
    heroText: 'text-white'
  },
  plastic: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-900',
    label: 'Plastik i Metal',
    description: 'butelki, puszki, opakowania',
    icon: <Recycle className="w-16 h-16" />,
    heroBg: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
    heroText: 'text-gray-900'
  },
  paper: {
    bg: 'bg-sky-100',
    text: 'text-sky-900',
    label: 'Papier',
    description: 'gazety, kartony, zeszyty',
    icon: <FileText className="w-16 h-16" />,
    heroBg: 'bg-gradient-to-br from-sky-400 to-sky-600',
    heroText: 'text-white'
  },
  glass: {
    bg: 'bg-lime-100',
    text: 'text-lime-900',
    label: 'Szkło',
    description: 'butelki, słoiki',
    icon: <Wine className="w-16 h-16" />,
    heroBg: 'bg-gradient-to-br from-lime-400 to-lime-600',
    heroText: 'text-gray-900'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-950',
    label: 'Zielone',
    description: 'trawa, liście, gałęzie',
    icon: <Trees className="w-16 h-16" />,
    heroBg: 'bg-gradient-to-br from-green-700 to-green-900',
    heroText: 'text-white'
  },
  bulky: {
    bg: 'bg-violet-100',
    text: 'text-violet-900',
    label: 'Wielkogabarytowe',
    description: 'meble, sprzęt RTV/AGD',
    icon: <Trash2 className="w-16 h-16" />,
    heroBg: 'bg-gradient-to-br from-violet-600 to-violet-800',
    heroText: 'text-white'
  },
  ash: {
    bg: 'bg-gray-200',
    text: 'text-gray-900',
    label: 'Popiół',
    description: 'z pieców i kotłów',
    icon: <Flame className="w-16 h-16" />,
    heroBg: 'bg-gradient-to-br from-gray-300 to-gray-500',
    heroText: 'text-gray-900'
  },
  textiles: {
    bg: 'bg-rose-100',
    text: 'text-rose-900',
    label: 'Tekstylia',
    description: 'odzież, tkaniny',
    icon: <Shirt className="w-16 h-16" />,
    heroBg: 'bg-gradient-to-br from-rose-400 to-rose-600',
    heroText: 'text-white'
  },
  christmas_trees: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-950',
    label: 'Choinki',
    description: 'choinki świąteczne',
    icon: <Trees className="w-16 h-16" />,
    heroBg: 'bg-gradient-to-br from-emerald-600 to-emerald-800',
    heroText: 'text-white'
  },
};

export function WasteModule() {
  const [areaType, setAreaType] = useState<'city' | 'village'>(() => {
    return (localStorage.getItem('wasteAreaType') as 'city' | 'village') || 'city';
  });
  const [areas, setAreas] = useState<WasteArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>(() => {
    return localStorage.getItem('selectedWasteArea') || '';
  });
  const [schedules, setSchedules] = useState<WasteSchedule[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    loadAreas();
  }, [areaType]);

  useEffect(() => {
    if (selectedArea) {
      loadSchedules();
    }
  }, [selectedArea]);

  async function loadAreas() {
    try {
      const { data } = await supabase
        .from('waste_areas')
        .select('*')
        .eq('type', areaType)
        .order('name');

      if (data) {
        setAreas(data);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadSchedules() {
    try {
      const today = getPolishDate();
      const thirtyDaysFromNow = getPolishDate();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const { data } = await supabase
        .from('waste_schedules')
        .select('*')
        .eq('area_id', selectedArea)
        .gte('collection_date', getPolishDateString(today))
        .lte('collection_date', getPolishDateString(thirtyDaysFromNow))
        .order('collection_date');

      if (data) {
        setSchedules(data);
        if (data.length > 0 && !selectedDate) {
          setSelectedDate(data[0].collection_date);
        }
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  }

  function handleAreaTypeChange(type: 'city' | 'village') {
    setAreaType(type);
    setSelectedArea('');
    setSchedules([]);
    setSelectedDate('');
    localStorage.setItem('wasteAreaType', type);
    localStorage.removeItem('selectedWasteArea');
  }

  function handleAreaSelect(areaId: string) {
    setSelectedArea(areaId);
    setSelectedDate('');
    localStorage.setItem('selectedWasteArea', areaId);
    if (areaId === '') {
      document.getElementById('odpady')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group schedules by date
  const schedulesByDate = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.collection_date]) {
      acc[schedule.collection_date] = [];
    }
    acc[schedule.collection_date].push(schedule);
    return acc;
  }, {} as Record<string, WasteSchedule[]>);

  // Get unique dates sorted
  const uniqueDates = Object.keys(schedulesByDate).sort();

  // Get collections for selected date or first date
  const displayDate = selectedDate || uniqueDates[0] || '';
  const displayCollections = schedulesByDate[displayDate] || [];

  // Get all collections for today or tomorrow
  const urgentCollections = schedules.filter(schedule => {
    const collectionDate = new Date(schedule.collection_date);
    return isToday(collectionDate) || isTomorrow(collectionDate);
  });

  // Group urgent collections by date
  const todayCollections = urgentCollections.filter(schedule =>
    isToday(new Date(schedule.collection_date))
  );
  const tomorrowCollections = urgentCollections.filter(schedule =>
    isTomorrow(new Date(schedule.collection_date))
  );

  function getDateColor(date: string): string {
    const collectionDate = new Date(date);
    if (isToday(collectionDate)) return 'text-red-600 font-bold';
    if (isTomorrow(collectionDate)) return 'text-orange-600 font-bold';
    return 'text-gray-700';
  }

  function getDaysUntilCollection(date: string): number {
    return getDaysUntil(new Date(date));
  }

  function getHeroCardStatus(date: string): {
    message: string;
    showPulse: boolean;
    borderColor: string;
  } {
    const collectionDate = new Date(date);
    if (isToday(collectionDate)) {
      return {
        message: '🚨 DZISIAJ - Śmieciarka w trasie!',
        showPulse: true,
        borderColor: 'border-4 border-red-500 animate-pulse-subtle',
      };
    }
    if (isTomorrow(collectionDate)) {
      return {
        message: '⚠️ JUTRO - Przygotuj odpady do odbioru!',
        showPulse: true,
        borderColor: 'border-4 border-orange-500 animate-pulse-subtle',
      };
    }
    return {
      message: '',
      showPulse: false,
      borderColor: '',
    };
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Trash2 className="w-6 h-6 text-green-600" />
        Wywóz odpadów – Gmina Grójec
      </h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleAreaTypeChange('city')}
          className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
            areaType === 'city'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Miasto
        </button>
        <button
          onClick={() => handleAreaTypeChange('village')}
          className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
            areaType === 'village'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Wieś
        </button>
      </div>

      {!selectedArea ? (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={areaType === 'city' ? 'Szukaj ulicy...' : 'Szukaj miejscowości...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredAreas.map(area => (
              <button
                key={area.id}
                onClick={() => handleAreaSelect(area.id)}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all font-semibold text-gray-900"
              >
                {area.name}
              </button>
            ))}
          </div>

          {filteredAreas.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Nie znaleziono {areaType === 'city' ? 'ulicy' : 'miejscowości'}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => handleAreaSelect('')}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            ← Zmień lokalizację
          </button>

          <div className="bg-gray-50 rounded-xl p-3 mb-2">
            <span className="text-sm text-gray-600">Wybrany obszar: </span>
            <span className="font-semibold text-gray-900">{areas.find(a => a.id === selectedArea)?.name}</span>
          </div>

          {todayCollections.length > 0 ? (
            <div className={`${todayCollections.length === 1 ? WASTE_COLORS[todayCollections[0].waste_type].heroBg : 'bg-gradient-to-br from-gray-700 to-gray-900'} text-white border-4 border-red-500 animate-pulse-subtle rounded-2xl p-8 text-center shadow-lg transition-all`}>
              <div className="text-2xl font-bold mb-6 text-red-200">
                🚨 DZISIAJ - Śmieciarka w trasie!
              </div>

              <div className="text-5xl font-black mb-6">
                {new Date(todayCollections[0].collection_date).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'long'
                })}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                {todayCollections.map((collection) => {
                  const wasteInfo = WASTE_COLORS[collection.waste_type];
                  const IconComponent = getWasteIcon(collection.waste_type);
                  return (
                    <div key={collection.id} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <IconComponent className="w-6 h-6 flex-shrink-0" />
                      <span className="font-semibold text-lg">{wasteInfo.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : tomorrowCollections.length > 0 ? (
            <div className={`${tomorrowCollections.length === 1 ? WASTE_COLORS[tomorrowCollections[0].waste_type].heroBg : 'bg-gradient-to-br from-gray-700 to-gray-900'} text-white border-4 border-orange-500 animate-pulse-subtle rounded-2xl p-8 text-center shadow-lg transition-all`}>
              <div className="text-2xl font-bold mb-6 text-orange-300">
                ⚠️ JUTRO - Przygotuj odpady do odbioru!
              </div>

              <div className="text-5xl font-black mb-6">
                {new Date(tomorrowCollections[0].collection_date).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'long'
                })}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                {tomorrowCollections.map((collection) => {
                  const wasteInfo = WASTE_COLORS[collection.waste_type];
                  const IconComponent = getWasteIcon(collection.waste_type);
                  return (
                    <div key={collection.id} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <IconComponent className="w-6 h-6 flex-shrink-0" />
                      <span className="font-semibold text-lg">{wasteInfo.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : displayCollections.length > 0 ? (
            <div className={`${displayCollections.length === 1 ? WASTE_COLORS[displayCollections[0].waste_type].heroBg : 'bg-gradient-to-br from-gray-700 to-gray-900'} text-white rounded-2xl p-8 text-center shadow-lg transition-all`}>
              <div className="text-5xl font-black mb-2">
                {new Date(displayDate).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'long'
                })}
              </div>

              <div className="text-xl opacity-90 mb-6">
                za {getDaysUntilCollection(displayDate)} {getDaysUntilCollection(displayDate) === 1 ? 'dzień' : 'dni'}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                {displayCollections.map((collection) => {
                  const wasteInfo = WASTE_COLORS[collection.waste_type];
                  const IconComponent = getWasteIcon(collection.waste_type);
                  return (
                    <div key={collection.id} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <IconComponent className="w-6 h-6 flex-shrink-0" />
                      <span className="font-semibold text-lg">{wasteInfo.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Brak zaplanowanych odbiorów w najbliższych 30 dniach</p>
          )}

          {uniqueDates.length > 1 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowFullSchedule(!showFullSchedule)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-gray-700">Pełny harmonogram</span>
                  <span className="text-xs text-gray-500">najbliższe 30 dni</span>
                </div>
                {showFullSchedule ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {showFullSchedule && (
                <div className="p-4 space-y-3">
                  {uniqueDates.map((date, dateIndex) => {
                    const dateCollections = schedulesByDate[date];
                    const daysUntil = getDaysUntilCollection(date);
                    const isDistant = daysUntil > 14;
                    const isFirst = dateIndex === 0;
                    const isSelected = date === displayDate;

                    return (
                      <button
                        key={date}
                        onClick={() => {
                          setSelectedDate(date);
                          document.getElementById('odpady')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className={`w-full py-3 px-3 border-b border-gray-100 last:border-0 rounded-lg transition-all hover:bg-gray-50 ${
                          isSelected ? 'bg-green-50 border-green-200' : ''
                        } ${isDistant ? 'opacity-60' : 'opacity-100'}`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex gap-2 flex-shrink-0">
                            {dateCollections.map((collection) => {
                              const wasteInfo = WASTE_COLORS[collection.waste_type];
                              return (
                                <div key={collection.id} className={`flex items-center justify-center w-12 h-12 rounded-lg ${wasteInfo.bg}`}>
                                  <div className={`${wasteInfo.text} scale-50`}>
                                    {wasteInfo.icon}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className={`text-sm font-semibold ${getDateColor(date)}`}>
                              {new Date(date).toLocaleDateString('pl-PL', {
                                day: 'numeric',
                                month: 'long'
                              })}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {daysUntil === 0 ? 'dziś' : daysUntil === 1 ? 'jutro' : `za ${daysUntil} dni`}
                            </div>
                          </div>
                        </div>
                        <div className="text-left pl-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <div className="text-sm font-semibold text-gray-900">
                              {dateCollections.map(c => WASTE_COLORS[c.waste_type].label).join(' + ')}
                            </div>
                            {isFirst && (
                              <span className="text-xs font-bold bg-green-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                                NAJBLIŻSZY
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {dateCollections.map(c => WASTE_COLORS[c.waste_type].description).join(', ')}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
