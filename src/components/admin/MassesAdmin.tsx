import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Parish, MassSchedule } from '../../lib/types';
import { formatTime } from '../../lib/timeFormat';
import { Modal } from '../Modal';
import { Plus, Copy, Trash2, Save } from 'lucide-react';

interface EditableMass extends MassSchedule {
  isNew?: boolean;
  isEdited?: boolean;
}

export function MassesAdmin() {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [selectedParish, setSelectedParish] = useState<string>('');
  const [masses, setMasses] = useState<EditableMass[]>([]);
  const [isParishModalOpen, setIsParishModalOpen] = useState(false);
  const [editingParish, setEditingParish] = useState<Parish | null>(null);
  const [selectedMasses, setSelectedMasses] = useState<Set<string>>(new Set());
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState<string>('');
  const [copyTargetParish, setCopyTargetParish] = useState<string>('');

  const [parishFormData, setParishFormData] = useState({
    name: '',
    address: '',
    google_place_id: '',
    navigation_link: '',
  });

  useEffect(() => {
    loadParishes();
  }, []);

  useEffect(() => {
    if (selectedParish) {
      loadMasses();
    }
  }, [selectedParish]);

  async function loadParishes() {
    const { data } = await supabase.from('parishes').select('*');
    if (data) {
      const sortedParishes = data.sort((a, b) => {
        if (a.name.includes('Najświętszego Serca') || a.address.includes('Worów')) return 1;
        if (b.name.includes('Najświętszego Serca') || b.address.includes('Worów')) return -1;
        return a.name.localeCompare(b.name);
      });
      setParishes(sortedParishes);
    }
  }

  async function loadMasses() {
    const { data } = await supabase
      .from('mass_schedules')
      .select('*')
      .eq('parish_id', selectedParish)
      .order('time');
    if (data) setMasses(data);
    setSelectedMasses(new Set());
  }

  async function handleParishSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingParish) {
      await supabase.from('parishes').update(parishFormData).eq('id', editingParish.id);
    } else {
      await supabase.from('parishes').insert(parishFormData);
    }

    setIsParishModalOpen(false);
    loadParishes();
  }

  async function handleDeleteParish(id: string) {
    if (confirm('Czy na pewno chcesz usunąć tę parafię? Usunięte zostaną też wszystkie msze.')) {
      await supabase.from('parishes').delete().eq('id', id);
      if (selectedParish === id) {
        setSelectedParish('');
        setMasses([]);
      }
      loadParishes();
    }
  }

  async function handleSaveDay(day: string) {
    const dayMasses = masses.filter(m => m.day_type === day);
    const newMasses = dayMasses.filter(m => m.isNew);
    const editedMasses = dayMasses.filter(m => m.isEdited && !m.isNew);

    // Insert new masses
    if (newMasses.length > 0) {
      const insertData = newMasses
        .filter(m => m.time && m.time.trim() !== '')
        .map(m => ({
          parish_id: selectedParish,
          day_type: m.day_type,
          time: m.time,
          title: m.title || 'Msza święta',
          is_periodic: m.is_periodic,
          duration_minutes: m.duration_minutes,
        }));

      if (insertData.length > 0) {
        await supabase.from('mass_schedules').insert(insertData);
      }
    }

    // Update edited masses
    for (const mass of editedMasses) {
      if (mass.time && mass.time.trim() !== '') {
        await supabase
          .from('mass_schedules')
          .update({
            time: mass.time,
            title: mass.title,
            is_periodic: mass.is_periodic,
            duration_minutes: mass.duration_minutes,
          })
          .eq('id', mass.id);
      }
    }

    loadMasses();
  }

  function handleAddNewMass(day: string) {
    const newMass: EditableMass = {
      id: `temp-${Date.now()}`,
      parish_id: selectedParish,
      day_type: day as any,
      time: '',
      title: 'Msza święta',
      is_periodic: false,
      duration_minutes: 60,
      created_at: new Date().toISOString(),
      isNew: true,
      isEdited: true,
    };

    setMasses([...masses, newMass]);
  }

  function handleUpdateMass(id: string, field: keyof EditableMass, value: any) {
    setMasses(masses.map(m =>
      m.id === id
        ? { ...m, [field]: value, isEdited: true }
        : m
    ));
  }

  function handleToggleSelect(id: string) {
    const newSelected = new Set(selectedMasses);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMasses(newSelected);
  }

  async function handleDeleteSelected() {
    const realIds = Array.from(selectedMasses).filter(id => !id.startsWith('temp-'));

    if (realIds.length === 0) {
      // Only temp items selected, just remove from state
      setMasses(masses.filter(m => !selectedMasses.has(m.id)));
      setSelectedMasses(new Set());
      return;
    }

    if (confirm(`Czy na pewno chcesz usunąć ${selectedMasses.size} nabożeństw?`)) {
      if (realIds.length > 0) {
        await supabase.from('mass_schedules').delete().in('id', realIds);
      }
      setMasses(masses.filter(m => !selectedMasses.has(m.id)));
      setSelectedMasses(new Set());
    }
  }

  async function handleDeleteMass(id: string) {
    if (id.startsWith('temp-')) {
      setMasses(masses.filter(m => m.id !== id));
      return;
    }

    if (confirm('Czy na pewno chcesz usunąć tę mszę?')) {
      await supabase.from('mass_schedules').delete().eq('id', id);
      loadMasses();
    }
  }

  async function copyMondayToWeekdays() {
    if (!confirm('Czy na pewno chcesz skopiować nabożeństwa z poniedziałku na wtorek-piątek? Istniejące nabożeństwa w te dni zostaną usunięte.')) {
      return;
    }

    const mondayMasses = masses.filter(m => m.day_type === 'monday' && !m.isNew);

    if (mondayMasses.length === 0) {
      alert('Brak nabożeństw w poniedziałek do skopiowania.');
      return;
    }

    await supabase
      .from('mass_schedules')
      .delete()
      .eq('parish_id', selectedParish)
      .in('day_type', ['tuesday', 'wednesday', 'thursday', 'friday']);

    const weekdays: Array<'tuesday' | 'wednesday' | 'thursday' | 'friday'> = ['tuesday', 'wednesday', 'thursday', 'friday'];

    for (const day of weekdays) {
      const newMasses = mondayMasses.map(m => ({
        parish_id: m.parish_id,
        day_type: day,
        time: m.time,
        title: m.title,
        is_periodic: m.is_periodic,
        duration_minutes: m.duration_minutes,
      }));

      await supabase.from('mass_schedules').insert(newMasses);
    }

    loadMasses();
    alert('Nabożeństwa z poniedziałku zostały skopiowane na pozostałe dni powszednie.');
  }

  async function handleCopyDayToParish() {
    if (!copySourceDay || !copyTargetParish) return;

    const sourceMasses = masses.filter(m => m.day_type === copySourceDay && !m.isNew);

    if (sourceMasses.length === 0) {
      alert('Brak nabożeństw do skopiowania w tym dniu.');
      return;
    }

    if (confirm(`Skopiować ${sourceMasses.length} nabożeństw z ${dayTypeLabels[copySourceDay as keyof typeof dayTypeLabels]} do innej parafii?`)) {
      await supabase
        .from('mass_schedules')
        .delete()
        .eq('parish_id', copyTargetParish)
        .eq('day_type', copySourceDay);

      const newMasses = sourceMasses.map(m => ({
        parish_id: copyTargetParish,
        day_type: m.day_type,
        time: m.time,
        title: m.title,
        is_periodic: m.is_periodic,
        duration_minutes: m.duration_minutes,
      }));

      await supabase.from('mass_schedules').insert(newMasses);

      setIsCopyModalOpen(false);
      alert('Nabożeństwa zostały skopiowane.');
    }
  }

  const dayTypeLabels = {
    monday: 'Poniedziałek',
    tuesday: 'Wtorek',
    wednesday: 'Środa',
    thursday: 'Czwartek',
    friday: 'Piątek',
    saturday: 'Sobota',
    sunday: 'Niedziela',
    holiday: 'Święto',
  };

  const hasEdits = masses.some(m => m.isEdited);
  const hasSelected = selectedMasses.size > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Parafie</h3>
          <button
            onClick={() => {
              setEditingParish(null);
              setParishFormData({ name: '', address: '', google_place_id: '', navigation_link: '' });
              setIsParishModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Dodaj parafię
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {parishes.map(parish => (
            <div
              key={parish.id}
              className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors ${
                selectedParish === parish.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedParish(parish.id)}
            >
              <div>
                <p className="font-semibold text-gray-900">{parish.name}</p>
                {parish.address && <p className="text-xs text-gray-500">{parish.address}</p>}
              </div>

              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setEditingParish(parish);
                    setParishFormData({
                      name: parish.name,
                      address: parish.address || '',
                      google_place_id: parish.google_place_id || '',
                      navigation_link: parish.navigation_link || ''
                    });
                    setIsParishModalOpen(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteParish(parish.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Nabożeństwa {selectedParish ? '' : '(wybierz parafię)'}
          </h3>
          {hasSelected && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Usuń zaznaczone ({selectedMasses.size})
            </button>
          )}
        </div>

        {selectedParish ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={copyMondayToWeekdays}
                className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 border border-blue-200 text-sm"
              >
                Kopiuj pon → wt-pt
              </button>
              <button
                onClick={() => setIsCopyModalOpen(true)}
                className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-semibold hover:bg-green-100 border border-green-200 text-sm"
              >
                <Copy className="w-4 h-4 inline mr-1" />
                Kopiuj do parafii
              </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                const dayMasses = masses.filter(m => m.day_type === day);
                const dayHasEdits = dayMasses.some(m => m.isEdited);

                return (
                  <div key={day} className="border border-gray-200 rounded-xl p-3 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-900 text-sm">
                        {dayTypeLabels[day as keyof typeof dayTypeLabels]}
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                          ({dayMasses.length})
                        </span>
                      </h4>
                      <div className="flex gap-2">
                        {dayHasEdits && (
                          <button
                            onClick={() => handleSaveDay(day)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700"
                          >
                            <Save className="w-3 h-3" />
                            Zapisz
                          </button>
                        )}
                        <button
                          onClick={() => handleAddNewMass(day)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                        >
                          <Plus className="w-3 h-3" />
                          Dodaj
                        </button>
                      </div>
                    </div>

                    {dayMasses.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Brak nabożeństw</p>
                    ) : (
                      <div className="space-y-2">
                        {dayMasses.map(mass => (
                          <div
                            key={mass.id}
                            className={`border rounded-lg p-2 flex items-center gap-2 ${
                              mass.isEdited ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100 bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedMasses.has(mass.id)}
                              onChange={() => handleToggleSelect(mass.id)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div className="flex-1 grid grid-cols-3 gap-2">
                              <input
                                type="time"
                                value={mass.time}
                                onChange={(e) => handleUpdateMass(mass.id, 'time', e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                value={mass.title || ''}
                                onChange={(e) => handleUpdateMass(mass.id, 'title', e.target.value)}
                                placeholder="Tytuł"
                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={mass.duration_minutes}
                                  onChange={(e) => handleUpdateMass(mass.id, 'duration_minutes', parseInt(e.target.value))}
                                  min="15"
                                  max="180"
                                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <label className="flex items-center gap-1 text-xs text-gray-600">
                                  <input
                                    type="checkbox"
                                    checked={mass.is_periodic}
                                    onChange={(e) => handleUpdateMass(mass.id, 'is_periodic', e.target.checked)}
                                    className="w-3 h-3 text-blue-600 rounded"
                                  />
                                  Okres.
                                </label>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteMass(mass.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Wybierz parafię aby zarządzać nabożeństwami
          </p>
        )}
      </div>

      <Modal
        isOpen={isParishModalOpen}
        onClose={() => setIsParishModalOpen(false)}
        title={editingParish ? 'Edytuj parafię' : 'Dodaj parafię'}
      >
        <form onSubmit={handleParishSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nazwa</label>
            <input
              type="text"
              value={parishFormData.name}
              onChange={(e) => setParishFormData({ ...parishFormData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Adres</label>
            <input
              type="text"
              value={parishFormData.address}
              onChange={(e) =>
                setParishFormData({ ...parishFormData, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Google Place ID</label>
            <input
              type="text"
              value={parishFormData.google_place_id}
              onChange={(e) =>
                setParishFormData({ ...parishFormData, google_place_id: e.target.value })
              }
              placeholder="np. ChIJX_BdOMU8GUcRI4LGZqXtUsE"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Opcjonalny: ID miejsca z Google Maps</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Link do nawigacji</label>
            <input
              type="url"
              value={parishFormData.navigation_link}
              onChange={(e) =>
                setParishFormData({ ...parishFormData, navigation_link: e.target.value })
              }
              placeholder="https://www.google.com/maps/place/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Opcjonalny: Bezpośredni link do Google Maps</p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsParishModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              {editingParish ? 'Zapisz' : 'Dodaj'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        title="Kopiuj dzień do innej parafii"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Dzień do skopiowania
            </label>
            <select
              value={copySourceDay}
              onChange={(e) => setCopySourceDay(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Wybierz dzień</option>
              {Object.entries(dayTypeLabels).slice(0, 7).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Parafia docelowa
            </label>
            <select
              value={copyTargetParish}
              onChange={(e) => setCopyTargetParish(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Wybierz parafię</option>
              {parishes.filter(p => p.id !== selectedParish).map(parish => (
                <option key={parish.id} value={parish.id}>{parish.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsCopyModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              onClick={handleCopyDayToParish}
              disabled={!copySourceDay || !copyTargetParish}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kopiuj
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
