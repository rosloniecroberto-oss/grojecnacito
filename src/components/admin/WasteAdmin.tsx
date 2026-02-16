import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { WasteArea, WasteSchedule } from '../../lib/types';
import { Modal } from '../Modal';
import { Pencil, Trash, Plus, Calendar, X, Edit } from 'lucide-react';

export function WasteAdmin() {
  const [areas, setAreas] = useState<WasteArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedAreasForSchedule, setSelectedAreasForSchedule] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<WasteSchedule[]>([]);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<WasteArea | null>(null);
  const [bulkEditAction, setBulkEditAction] = useState<'add' | 'delete'>('add');

  const [areaFormData, setAreaFormData] = useState({
    type: 'city' as 'city' | 'village',
    names: '',
    zone: '',
  });

  const [scheduleFormData, setScheduleFormData] = useState({
    waste_type: 'mixed' as 'mixed' | 'plastic' | 'paper' | 'glass' | 'green' | 'christmas_trees' | 'bulky' | 'ash' | 'textiles',
    selectedDates: [] as string[],
  });

  const [dateWasteTypes, setDateWasteTypes] = useState<Record<string, Set<string>>>({});
  const [bulkEditSchedules, setBulkEditSchedules] = useState<WasteSchedule[]>([]);

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(0);

  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    if (selectedArea) {
      loadSchedules();
    }
  }, [selectedArea]);

  useEffect(() => {
    if (isBulkEditModalOpen && selectedAreasForSchedule.length > 0) {
      loadBulkEditSchedules();
    } else {
      setBulkEditSchedules([]);
    }
  }, [selectedAreasForSchedule, isBulkEditModalOpen, currentYear, currentMonth]);

  async function loadAreas() {
    const { data } = await supabase.from('waste_areas').select('*').order('name');
    if (data) setAreas(data);
  }

  async function loadSchedules() {
    const { data } = await supabase
      .from('waste_schedules')
      .select('*')
      .eq('area_id', selectedArea)
      .order('collection_date');
    if (data) setSchedules(data);
  }

  async function loadBulkEditSchedules() {
    if (selectedAreasForSchedule.length === 0) return;

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

    const { data } = await supabase
      .from('waste_schedules')
      .select('*')
      .in('area_id', selectedAreasForSchedule)
      .gte('collection_date', startDate)
      .lte('collection_date', endDate)
      .order('collection_date');

    if (data) setBulkEditSchedules(data);
  }

  async function handleAreaSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingArea) {
      await supabase.from('waste_areas').update({
        type: areaFormData.type,
        name: areaFormData.names.trim(),
        zone: areaFormData.zone.trim() || null,
      }).eq('id', editingArea.id);
    } else {
      const names = areaFormData.names
        .split(/[\n,]/)
        .map(n => n.trim())
        .filter(n => n.length > 0);

      if (names.length === 0) {
        alert('Wprowadź przynajmniej jedną nazwę');
        return;
      }

      const zone = areaFormData.zone.trim() || null;
      const records = names.map(name => ({
        type: areaFormData.type,
        name: name,
        zone: zone,
      }));

      await supabase.from('waste_areas').insert(records);
    }

    setIsAreaModalOpen(false);
    loadAreas();
  }

  async function handleScheduleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (scheduleFormData.selectedDates.length === 0) {
      alert('Wybierz przynajmniej jedną datę');
      return;
    }

    if (selectedAreasForSchedule.length === 0) {
      alert('Wybierz przynajmniej jeden obszar');
      return;
    }

    const totalWasteTypes = scheduleFormData.selectedDates.reduce((sum, date) => sum + (dateWasteTypes[date]?.size || 0), 0);
    if (totalWasteTypes === 0) {
      alert('Zaznacz przynajmniej jeden typ odpadów dla wybranych dat');
      return;
    }

    const records = selectedAreasForSchedule.flatMap(areaId =>
      scheduleFormData.selectedDates.flatMap(date => {
        const wasteTypes = dateWasteTypes[date] || new Set(['mixed']);
        return Array.from(wasteTypes).map(wasteType => ({
          area_id: areaId,
          waste_type: wasteType,
          collection_date: date,
        }));
      })
    );

    await supabase.from('waste_schedules').insert(records);

    setIsScheduleModalOpen(false);
    setScheduleFormData({ ...scheduleFormData, selectedDates: [] });
    setSelectedAreasForSchedule([]);
    setDateWasteTypes({});
    loadSchedules();
  }

  async function handleBulkEditSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (scheduleFormData.selectedDates.length === 0) {
      alert('Wybierz przynajmniej jedną datę');
      return;
    }

    if (selectedAreasForSchedule.length === 0) {
      alert('Wybierz przynajmniej jeden obszar');
      return;
    }

    const totalWasteTypes = scheduleFormData.selectedDates.reduce((sum, date) => sum + (dateWasteTypes[date]?.size || 0), 0);
    if (totalWasteTypes === 0) {
      alert('Zaznacz przynajmniej jeden typ odpadów dla wybranych dat');
      return;
    }

    if (bulkEditAction === 'add') {
      const records = selectedAreasForSchedule.flatMap(areaId =>
        scheduleFormData.selectedDates.flatMap(date => {
          const wasteTypes = dateWasteTypes[date] || new Set(['mixed']);
          return Array.from(wasteTypes).map(wasteType => ({
            area_id: areaId,
            waste_type: wasteType,
            collection_date: date,
          }));
        })
      );
      await supabase.from('waste_schedules').insert(records);
    } else {
      for (const areaId of selectedAreasForSchedule) {
        for (const date of scheduleFormData.selectedDates) {
          const wasteTypes = dateWasteTypes[date];
          if (wasteTypes && wasteTypes.size > 0) {
            for (const wasteType of wasteTypes) {
              await supabase
                .from('waste_schedules')
                .delete()
                .eq('area_id', areaId)
                .eq('waste_type', wasteType)
                .eq('collection_date', date);
            }
          }
        }
      }
    }

    setIsBulkEditModalOpen(false);
    setScheduleFormData({ ...scheduleFormData, selectedDates: [] });
    setSelectedAreasForSchedule([]);
    setDateWasteTypes({});
    loadSchedules();
  }

  async function handleDeleteArea(id: string) {
    if (confirm('Czy na pewno chcesz usunąć ten obszar? Usunięte zostaną też wszystkie harmonogramy.')) {
      await supabase.from('waste_areas').delete().eq('id', id);
      if (selectedArea === id) {
        setSelectedArea('');
        setSchedules([]);
      }
      loadAreas();
    }
  }

  async function handleDeleteSchedule(id: string) {
    if (confirm('Czy na pewno chcesz usunąć ten harmonogram?')) {
      await supabase.from('waste_schedules').delete().eq('id', id);
      loadSchedules();
    }
  }

  function toggleDate(dateStr: string) {
    const isCurrentlySelected = scheduleFormData.selectedDates.includes(dateStr);

    setScheduleFormData(prev => ({
      ...prev,
      selectedDates: isCurrentlySelected
        ? prev.selectedDates.filter(d => d !== dateStr)
        : [...prev.selectedDates, dateStr],
    }));

    if (isCurrentlySelected) {
      setDateWasteTypes(prev => {
        const newTypes = { ...prev };
        delete newTypes[dateStr];
        return newTypes;
      });
    } else {
      const existingSchedules = bulkEditSchedules.filter(s => s.collection_date === dateStr);
      const existingTypes = Array.from(new Set(existingSchedules.map(s => s.waste_type)));

      setDateWasteTypes(prev => ({
        ...prev,
        [dateStr]: existingTypes.length > 0 ? new Set(existingTypes) : new Set(['mixed'])
      }));
    }
  }

  function toggleWasteTypeForDate(dateStr: string, wasteType: string) {
    setDateWasteTypes(prev => {
      const newTypes = { ...prev };
      if (!newTypes[dateStr]) {
        newTypes[dateStr] = new Set();
      }
      const dateTypes = new Set(newTypes[dateStr]);
      if (dateTypes.has(wasteType)) {
        dateTypes.delete(wasteType);
      } else {
        dateTypes.add(wasteType);
      }
      newTypes[dateStr] = dateTypes;
      return newTypes;
    });
  }

  function renderCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = scheduleFormData.selectedDates.includes(dateStr);
      const dateTypes = dateWasteTypes[dateStr];
      const hasTypes = dateTypes && dateTypes.size > 0;

      const existingSchedules = bulkEditSchedules.filter(s => s.collection_date === dateStr);
      const existingWasteTypes = Array.from(new Set(existingSchedules.map(s => s.waste_type)));
      const hasExisting = existingSchedules.length > 0;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => toggleDate(dateStr)}
          className={`aspect-square rounded-lg text-sm font-medium transition-all relative ${
            isSelected
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <span className="relative z-10">{day}</span>
          {hasExisting && (
            <div className="absolute top-0.5 right-0.5 flex gap-0.5">
              {existingWasteTypes.slice(0, 3).map(type => (
                <div
                  key={type}
                  className={`w-1.5 h-1.5 rounded-full ${wasteTypeColors[type]}`}
                  title={`Istniejący: ${wasteTypeLabels[type as keyof typeof wasteTypeLabels]}`}
                />
              ))}
            </div>
          )}
          {isSelected && hasTypes && (
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
              {Array.from(dateTypes).slice(0, 3).map(type => (
                <div
                  key={type}
                  className={`w-1.5 h-1.5 rounded-full ${wasteTypeColors[type]} border border-white`}
                />
              ))}
            </div>
          )}
        </button>
      );
    }

    return days;
  }

  const wasteTypeLabels = {
    mixed: 'Zmieszane',
    plastic: 'Plastik/Metal',
    paper: 'Papier',
    glass: 'Szkło',
    green: 'Zielone',
    christmas_trees: 'Choinki',
    bulky: 'Wielkogabarytowe',
    ash: 'Popiół',
    textiles: 'Tekstylia',
  };

  const wasteTypeColors: Record<string, string> = {
    mixed: 'bg-zinc-700',
    plastic: 'bg-yellow-500',
    paper: 'bg-sky-500',
    glass: 'bg-lime-500',
    green: 'bg-green-700',
    christmas_trees: 'bg-emerald-600',
    bulky: 'bg-violet-500',
    ash: 'bg-gray-400',
    textiles: 'bg-rose-500',
  };

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Ulice / Miejscowości</h3>
          <button
            onClick={() => {
              setEditingArea(null);
              setAreaFormData({ type: 'city', names: '', zone: '' });
              setIsAreaModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Dodaj
          </button>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {areas.map(area => (
            <div
              key={area.id}
              className={`border rounded-xl p-3 cursor-pointer transition-colors ${
                selectedArea === area.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedArea(area.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">
                      {area.type === 'city' ? 'Miasto' : 'Wieś'}
                    </span>
                    {area.zone && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-md">
                        {area.zone}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900">{area.name}</p>
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setEditingArea(area);
                      setAreaFormData({
                        type: area.type,
                        names: area.name,
                        zone: area.zone || '',
                      });
                      setIsAreaModalOpen(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteArea(area.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Harmonogram {selectedArea ? '' : '(wybierz lokalizację)'}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setScheduleFormData({ waste_type: 'mixed', selectedDates: [] });
                setSelectedAreasForSchedule([]);
                setDateWasteTypes({});
                setBulkEditAction('add');
                setCurrentYear(2026);
                setCurrentMonth(0);
                setIsBulkEditModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              Masowa edycja
            </button>
            {selectedArea && (
              <button
                onClick={() => {
                  setScheduleFormData({ waste_type: 'mixed', selectedDates: [] });
                  setSelectedAreasForSchedule([selectedArea]);
                  setDateWasteTypes({});
                  setCurrentYear(2026);
                  setCurrentMonth(0);
                  setIsScheduleModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
              >
                <Calendar className="w-4 h-4" />
                Dodaj daty
              </button>
            )}
          </div>
        </div>

        {selectedArea ? (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {schedules.map(schedule => (
              <div
                key={schedule.id}
                className="border border-gray-200 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${wasteTypeColors[schedule.waste_type]}`}
                  />
                  <div>
                    <span className="font-semibold text-gray-900">
                      {wasteTypeLabels[schedule.waste_type]}
                    </span>
                    <p className="text-sm text-gray-600">
                      {new Date(schedule.collection_date + 'T00:00:00').toLocaleDateString('pl-PL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Wybierz ulicę/miejscowość aby zarządzać harmonogramem
          </p>
        )}
      </div>

      <Modal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        title={editingArea ? 'Edytuj lokalizację' : 'Dodaj lokalizację'}
      >
        <form onSubmit={handleAreaSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Typ</label>
            <select
              value={areaFormData.type}
              onChange={(e) =>
                setAreaFormData({ ...areaFormData, type: e.target.value as any })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
            >
              <option value="city">Miasto</option>
              <option value="village">Wieś</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {editingArea
                ? (areaFormData.type === 'city' ? 'Nazwa ulicy' : 'Nazwa miejscowości')
                : (areaFormData.type === 'city' ? 'Nazwy ulic' : 'Nazwy miejscowości')}
            </label>
            {editingArea ? (
              <input
                type="text"
                value={areaFormData.names}
                onChange={(e) => setAreaFormData({ ...areaFormData, names: e.target.value })}
                placeholder={areaFormData.type === 'city' ? 'np. Angielska' : 'np. Kobylin'}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
            ) : (
              <textarea
                value={areaFormData.names}
                onChange={(e) => setAreaFormData({ ...areaFormData, names: e.target.value })}
                placeholder={
                  areaFormData.type === 'city'
                    ? 'Angielska\nBiskupińska\nChełmońskiego\nlub: Angielska, Biskupińska, Chełmońskiego'
                    : 'Kobylin\nBronica\nGalewice\nlub: Kobylin, Bronica, Galewice'
                }
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 font-mono text-sm"
                required
              />
            )}
            <p className="text-xs text-gray-500 mt-1">
              {editingArea
                ? `Edycja pojedynczego rekordu`
                : `Każda ${areaFormData.type === 'city' ? 'ulica' : 'miejscowość'} w nowej linii lub oddzielona przecinkiem`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Rejon (opcjonalnie)
            </label>
            <input
              type="text"
              value={areaFormData.zone}
              onChange={(e) => setAreaFormData({ ...areaFormData, zone: e.target.value })}
              placeholder={areaFormData.type === 'city' ? 'np. M1, M2, M3' : 'np. W1, W2, W3'}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {editingArea
                ? 'Rejon ułatwia grupowe zarządzanie harmonogramem'
                : `Wszystkie ${areaFormData.type === 'city' ? 'ulice' : 'miejscowości'} dostaną ten sam rejon`}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsAreaModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
            >
              {editingArea ? 'Zapisz' : 'Dodaj'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setDateWasteTypes({});
          setScheduleFormData({ waste_type: 'mixed', selectedDates: [] });
        }}
        title="Dodaj harmonogram odbioru"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Obszary ({selectedAreasForSchedule.length} wybranych)
            </label>
            <div className="border border-gray-300 rounded-xl p-3 max-h-64 overflow-y-auto space-y-1">
              <div className="flex flex-wrap gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    const currentType = areas.find(a => a.id === selectedArea)?.type || 'city';
                    const sameTypeAreas = areas.filter(a => a.type === currentType);
                    if (selectedAreasForSchedule.length === sameTypeAreas.length) {
                      setSelectedAreasForSchedule([]);
                    } else {
                      setSelectedAreasForSchedule(sameTypeAreas.map(a => a.id));
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100"
                >
                  {selectedAreasForSchedule.length === areas.filter(a => a.type === (areas.find(area => area.id === selectedArea)?.type || 'city')).length
                    ? '✓ Wszystkie'
                    : '☐ Wszystkie'}
                </button>
                {(() => {
                  const currentType = areas.find(a => a.id === selectedArea)?.type || 'city';
                  const sameTypeAreas = areas.filter(a => a.type === currentType);
                  const uniqueZones = Array.from(new Set(sameTypeAreas.map(a => a.zone).filter(Boolean))).sort();
                  return uniqueZones.map(zone => {
                    const zoneAreas = sameTypeAreas.filter(a => a.zone === zone);
                    const allZoneSelected = zoneAreas.every(a => selectedAreasForSchedule.includes(a.id));
                    return (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => {
                          if (allZoneSelected) {
                            setSelectedAreasForSchedule(selectedAreasForSchedule.filter(id => !zoneAreas.some(a => a.id === id)));
                          } else {
                            const newSelected = [...selectedAreasForSchedule];
                            zoneAreas.forEach(a => {
                              if (!newSelected.includes(a.id)) {
                                newSelected.push(a.id);
                              }
                            });
                            setSelectedAreasForSchedule(newSelected);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          allZoneSelected
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {allZoneSelected ? '✓ ' : ''}{zone} ({zoneAreas.length})
                      </button>
                    );
                  });
                })()}
              </div>
              {areas
                .filter(a => a.type === (areas.find(area => area.id === selectedArea)?.type || 'city'))
                .map(area => (
                  <label
                    key={area.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      selectedAreasForSchedule.includes(area.id)
                        ? 'bg-green-50 border border-green-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAreasForSchedule.includes(area.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAreasForSchedule([...selectedAreasForSchedule, area.id]);
                        } else {
                          setSelectedAreasForSchedule(selectedAreasForSchedule.filter(id => id !== area.id));
                        }
                      }}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-900">{area.name}</span>
                    {area.zone && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-md ml-auto">
                        {area.zone}
                      </span>
                    )}
                  </label>
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Wybierz wiele obszarów aby dodać dla nich ten sam harmonogram
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Wybierz daty (kliknij na kalendarzu)
              </label>
              {scheduleFormData.selectedDates.length > 0 && (
                <span className="text-xs font-semibold text-green-600">
                  {scheduleFormData.selectedDates.length} wybranych
                </span>
              )}
            </div>

            <div className="border border-gray-300 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(currentYear - 1);
                    } else {
                      setCurrentMonth(currentMonth - 1);
                    }
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  ←
                </button>
                <span className="font-semibold text-gray-900">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (currentMonth === 11) {
                      setCurrentMonth(0);
                      setCurrentYear(currentYear + 1);
                    } else {
                      setCurrentMonth(currentMonth + 1);
                    }
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              <p>• Zielone - wybrane daty, kolorowe kropki pokazują przypisane typy odpadów</p>
            </div>
          </div>

          {scheduleFormData.selectedDates.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Przypisz typy odpadów do każdej daty:
              </label>
              <div className="space-y-2 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                {scheduleFormData.selectedDates.sort().map(date => (
                  <div
                    key={date}
                    className="border border-gray-200 bg-white rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {new Date(date + 'T00:00:00').toLocaleDateString('pl-PL', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(dateWasteTypes[date]?.size || 0)} typów)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleDate(date)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {Object.entries(wasteTypeLabels).map(([key, label]) => {
                        const isSelected = dateWasteTypes[date]?.has(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggleWasteTypeForDate(date, key)}
                            className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isSelected
                                ? `${wasteTypeColors[key]} text-white shadow-sm`
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {isSelected ? '✓ ' : ''}{label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Zaznacz jeden lub więcej typów dla każdej daty
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={
                scheduleFormData.selectedDates.length === 0 ||
                selectedAreasForSchedule.length === 0 ||
                scheduleFormData.selectedDates.reduce((sum, date) => sum + (dateWasteTypes[date]?.size || 0), 0) === 0
              }
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Dodaj ({selectedAreasForSchedule.length} obszarów × {scheduleFormData.selectedDates.reduce((sum, date) => sum + (dateWasteTypes[date]?.size || 0), 0)} odbiory = {selectedAreasForSchedule.length * scheduleFormData.selectedDates.reduce((sum, date) => sum + (dateWasteTypes[date]?.size || 0), 0)})
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isBulkEditModalOpen}
        onClose={() => {
          setIsBulkEditModalOpen(false);
          setDateWasteTypes({});
          setScheduleFormData({ waste_type: 'mixed', selectedDates: [] });
        }}
        title="Masowa edycja harmonogramu"
      >
        <form onSubmit={handleBulkEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Akcja
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBulkEditAction('add')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  bulkEditAction === 'add'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dodaj daty
              </button>
              <button
                type="button"
                onClick={() => setBulkEditAction('delete')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  bulkEditAction === 'delete'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Usuń daty
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Obszary ({selectedAreasForSchedule.length} wybranych)
            </label>
            <div className="border border-gray-300 rounded-xl p-3 max-h-64 overflow-y-auto space-y-1">
              <div className="flex flex-wrap gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAreasForSchedule.length === areas.length) {
                      setSelectedAreasForSchedule([]);
                    } else {
                      setSelectedAreasForSchedule(areas.map(a => a.id));
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100"
                >
                  {selectedAreasForSchedule.length === areas.length
                    ? '✓ Wszystkie'
                    : '☐ Wszystkie'}
                </button>
                {(() => {
                  const uniqueZones = Array.from(new Set(areas.map(a => a.zone).filter(Boolean))).sort();
                  return uniqueZones.map(zone => {
                    const zoneAreas = areas.filter(a => a.zone === zone);
                    const allZoneSelected = zoneAreas.every(a => selectedAreasForSchedule.includes(a.id));
                    return (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => {
                          if (allZoneSelected) {
                            setSelectedAreasForSchedule(selectedAreasForSchedule.filter(id => !zoneAreas.some(a => a.id === id)));
                          } else {
                            const newSelected = [...selectedAreasForSchedule];
                            zoneAreas.forEach(a => {
                              if (!newSelected.includes(a.id)) {
                                newSelected.push(a.id);
                              }
                            });
                            setSelectedAreasForSchedule(newSelected);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          allZoneSelected
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {allZoneSelected ? '✓ ' : ''}{zone} ({zoneAreas.length})
                      </button>
                    );
                  });
                })()}
              </div>
              {areas.map(area => (
                <label
                  key={area.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    selectedAreasForSchedule.includes(area.id)
                      ? 'bg-green-50 border border-green-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAreasForSchedule.includes(area.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAreasForSchedule([...selectedAreasForSchedule, area.id]);
                      } else {
                        setSelectedAreasForSchedule(selectedAreasForSchedule.filter(id => id !== area.id));
                      }
                    }}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-900">{area.name}</span>
                  {area.zone && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-md ml-auto">
                      {area.zone}
                    </span>
                  )}
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Użyj przycisków rejonowych aby szybko zaznaczyć wiele ulic
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Wybierz daty (kliknij na kalendarzu)
              </label>
              {scheduleFormData.selectedDates.length > 0 && (
                <span className="text-xs font-semibold text-green-600">
                  {scheduleFormData.selectedDates.length} wybranych
                </span>
              )}
            </div>

            <div className="border border-gray-300 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(currentYear - 1);
                    } else {
                      setCurrentMonth(currentMonth - 1);
                    }
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  ←
                </button>
                <span className="font-semibold text-gray-900">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (currentMonth === 11) {
                      setCurrentMonth(0);
                      setCurrentYear(currentYear + 1);
                    } else {
                      setCurrentMonth(currentMonth + 1);
                    }
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <p>• Zielone - wybrane daty, kolorowe kropki na dole pokazują przypisane typy odpadów</p>
              <p>• Kolorowe kropki w prawym górnym rogu - istniejące wpisy w bazie dla wybranych obszarów</p>
              {bulkEditAction === 'delete' && <p>• Zaznaczone daty + typy zostaną usunięte dla wybranych obszarów</p>}
            </div>
          </div>

          {scheduleFormData.selectedDates.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Przypisz typy odpadów do każdej daty:
              </label>
              <div className="space-y-2 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                {scheduleFormData.selectedDates.sort().map(date => (
                  <div
                    key={date}
                    className="border border-gray-200 bg-white rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {new Date(date + 'T00:00:00').toLocaleDateString('pl-PL', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(dateWasteTypes[date]?.size || 0)} typów)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleDate(date)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {Object.entries(wasteTypeLabels).map(([key, label]) => {
                        const isSelected = dateWasteTypes[date]?.has(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggleWasteTypeForDate(date, key)}
                            className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isSelected
                                ? `${wasteTypeColors[key]} text-white shadow-sm`
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {isSelected ? '✓ ' : ''}{label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {bulkEditAction === 'add' ? 'Zaznacz typy do dodania' : 'Zaznacz typy do usunięcia'}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsBulkEditModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={
                scheduleFormData.selectedDates.length === 0 ||
                selectedAreasForSchedule.length === 0 ||
                scheduleFormData.selectedDates.reduce((sum, date) => sum + (dateWasteTypes[date]?.size || 0), 0) === 0
              }
              className={`flex-1 px-4 py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                bulkEditAction === 'add'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {bulkEditAction === 'add' ? 'Dodaj' : 'Usuń'} ({selectedAreasForSchedule.length} obszarów × {scheduleFormData.selectedDates.reduce((sum, date) => sum + (dateWasteTypes[date]?.size || 0), 0)} odbiory = {selectedAreasForSchedule.length * scheduleFormData.selectedDates.reduce((sum, date) => sum + (dateWasteTypes[date]?.size || 0), 0)})
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
