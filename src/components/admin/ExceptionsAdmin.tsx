import { useState, useEffect } from 'react';
import { Plus, Trash, Pencil, Calendar, Download, CheckSquare, Square } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { MassScheduleException, Parish } from '../../lib/types';
import { formatTime } from '../../lib/timeFormat';
import { Modal } from '../Modal';
import { Toast } from '../Toast';

interface MassEntry {
  time: string;
  title: string;
  duration_minutes: number;
}

export default function ExceptionsAdmin() {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [selectedParish, setSelectedParish] = useState('');
  const [exceptions, setExceptions] = useState<MassScheduleException[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingException, setEditingException] = useState<MassScheduleException | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedExceptions, setSelectedExceptions] = useState<Set<string>>(new Set());

  const [eventDate, setEventDate] = useState('');
  const [eventName, setEventName] = useState('');
  const [bulkTimeInput, setBulkTimeInput] = useState('');
  const [massEntries, setMassEntries] = useState<MassEntry[]>([
    { time: '', title: 'Msza święta', duration_minutes: 60 }
  ]);

  useEffect(() => {
    loadParishes();
  }, []);

  useEffect(() => {
    if (selectedParish) {
      loadExceptions();
    }
  }, [selectedParish]);

  async function loadParishes() {
    const { data } = await supabase
      .from('parishes')
      .select('*');
    if (data) {
      const sortedParishes = data.sort((a, b) => {
        if (a.name.includes('Najświętszego Serca') || a.address.includes('Worów')) return 1;
        if (b.name.includes('Najświętszego Serca') || b.address.includes('Worów')) return -1;
        return a.name.localeCompare(b.name);
      });
      setParishes(sortedParishes);
    }
  }

  async function loadExceptions() {
    const { data } = await supabase
      .from('mass_schedule_exceptions')
      .select('*')
      .eq('parish_id', selectedParish)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (data) setExceptions(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedParish || !eventDate) {
      setToastMessage('Wybierz parafię i datę');
      return;
    }

    const validEntries = massEntries.filter(entry => entry.time.trim() !== '');

    if (validEntries.length === 0) {
      setToastMessage('Dodaj co najmniej jedną mszę');
      return;
    }

    if (editingException) {
      const payload = {
        parish_id: selectedParish,
        date: eventDate,
        time: validEntries[0].time,
        title: validEntries[0].title,
        event_name: eventName || null,
        duration_minutes: validEntries[0].duration_minutes,
      };

      await supabase
        .from('mass_schedule_exceptions')
        .update(payload)
        .eq('id', editingException.id);
    } else {
      const exceptions = validEntries.map(entry => ({
        parish_id: selectedParish,
        date: eventDate,
        time: entry.time,
        title: entry.title,
        event_name: eventName || null,
        duration_minutes: entry.duration_minutes,
      }));

      await supabase.from('mass_schedule_exceptions').insert(exceptions);
    }

    setToastMessage(editingException ? 'Zapisano zmiany' : `Dodano ${validEntries.length} nabożeństw`);
    resetForm();
    loadExceptions();
  }

  function resetForm() {
    setIsModalOpen(false);
    setEditingException(null);
    setEventDate('');
    setEventName('');
    setBulkTimeInput('');
    setMassEntries([{ time: '', title: 'Msza święta', duration_minutes: 60 }]);
  }

  function handleBulkTimeInput() {
    if (!bulkTimeInput.trim()) {
      setToastMessage('Wpisz godziny oddzielone przecinkami');
      return;
    }

    const times = bulkTimeInput
      .split(/[,;]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (times.length === 0) {
      setToastMessage('Nie znaleziono poprawnych godzin');
      return;
    }

    const newEntries: MassEntry[] = times.map(time => ({
      time,
      title: 'Msza święta',
      duration_minutes: 60,
    }));

    setMassEntries(newEntries);
    setBulkTimeInput('');
    setToastMessage(`Dodano ${newEntries.length} godzin`);
  }

  async function handleDelete(id: string) {
    if (confirm('Czy na pewno chcesz usunąć ten wyjątek?')) {
      await supabase.from('mass_schedule_exceptions').delete().eq('id', id);
      loadExceptions();
      setToastMessage('Usunięto wyjątek');
    }
  }

  async function handleBulkDelete() {
    if (selectedExceptions.size === 0) return;

    if (confirm(`Czy na pewno chcesz usunąć ${selectedExceptions.size} zaznaczonych wyjątków?`)) {
      await supabase
        .from('mass_schedule_exceptions')
        .delete()
        .in('id', Array.from(selectedExceptions));

      setSelectedExceptions(new Set());
      loadExceptions();
      setToastMessage(`Usunięto ${selectedExceptions.size} wyjątków`);
    }
  }

  async function cleanupPastExceptions() {
    if (!confirm('Czy na pewno chcesz usunąć wszystkie wyjątki starsze niż dzisiaj?')) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('mass_schedule_exceptions')
      .delete()
      .eq('parish_id', selectedParish)
      .lt('date', today);

    if (error) {
      setToastMessage('Błąd podczas czyszczenia: ' + error.message);
    } else {
      setToastMessage('Wyczyszczono przeszłe wyjątki');
      loadExceptions();
    }
  }

  async function importSchedule(dayType: 'sunday' | 'weekday') {
    if (!selectedParish || !eventDate) {
      setToastMessage('Wybierz parafię i datę przed importem');
      return;
    }

    const targetDay = dayType === 'sunday' ? 'sunday' : 'monday';

    const { data: masses, error } = await supabase
      .from('mass_schedules')
      .select('*')
      .eq('parish_id', selectedParish)
      .eq('day_type', targetDay)
      .order('time');

    if (error) {
      setToastMessage('Błąd podczas importu: ' + error.message);
      return;
    }

    if (!masses || masses.length === 0) {
      setToastMessage(`Brak nabożeństw w harmonogramie ${dayType === 'sunday' ? 'niedzielnym' : 'powszednim'}`);
      return;
    }

    const importedEntries: MassEntry[] = masses.map(mass => ({
      time: mass.time,
      title: mass.title,
      duration_minutes: mass.duration_minutes,
    }));

    setMassEntries(importedEntries);
    setToastMessage(`Zaimportowano ${masses.length} nabożeństw - możesz je edytować przed zapisem`);
  }

  function addMassEntry() {
    setMassEntries([...massEntries, { time: '', title: 'Msza święta', duration_minutes: 60 }]);
  }

  function removeMassEntry(index: number) {
    if (massEntries.length === 1) {
      setToastMessage('Musi zostać co najmniej jedno pole');
      return;
    }
    setMassEntries(massEntries.filter((_, i) => i !== index));
  }

  function updateMassEntry(index: number, field: keyof MassEntry, value: string | number) {
    const updated = [...massEntries];
    updated[index] = { ...updated[index], [field]: value };
    setMassEntries(updated);
  }

  function toggleException(id: string) {
    const newSelected = new Set(selectedExceptions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedExceptions(newSelected);
  }

  function toggleSelectAll() {
    if (selectedExceptions.size === exceptions.length) {
      setSelectedExceptions(new Set());
    } else {
      setSelectedExceptions(new Set(exceptions.map(exc => exc.id)));
    }
  }

  function groupExceptionsByDate() {
    const grouped: { [date: string]: MassScheduleException[] } = {};

    exceptions.forEach(exc => {
      if (!grouped[exc.date]) {
        grouped[exc.date] = [];
      }
      grouped[exc.date].push(exc);
    });

    return grouped;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function isDateInPast(dateString: string): boolean {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  const groupedExceptions = groupExceptionsByDate();
  const sortedDates = Object.keys(groupedExceptions).sort();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Harmonogram Wyjątków</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Wybierz parafię
          </label>
          <select
            value={selectedParish}
            onChange={(e) => setSelectedParish(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
          >
            <option value="">-- Wybierz parafię --</option>
            {parishes.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedParish && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
            <p className="text-sm font-semibold text-blue-900">
              Wybrana parafia: {parishes.find(p => p.id === selectedParish)?.name}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Liczba wyjątków: {exceptions.length}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingException(null);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setEventDate(tomorrow.toISOString().split('T')[0]);
                setEventName('');
                setMassEntries([{ time: '', title: 'Msza święta', duration_minutes: 60 }]);
                setIsModalOpen(true);
              }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Dodaj wyjątek
            </button>

            <button
              onClick={loadExceptions}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 border border-blue-200 text-sm"
            >
              Odśwież
            </button>

            <button
              onClick={cleanupPastExceptions}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-xl font-semibold hover:bg-red-100 border border-red-200 text-sm"
            >
              Wyczyść przeszłe
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-700">
                Lista zaplanowanych wyjątków
              </h4>
              {exceptions.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-semibold"
                  >
                    {selectedExceptions.size === exceptions.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    Zaznacz wszystkie
                  </button>
                  {selectedExceptions.size > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg font-semibold hover:bg-red-700 flex items-center gap-1"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      Usuń zaznaczone ({selectedExceptions.size})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedDates.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Brak zaplanowanych wyjątków
              </p>
            ) : (
              sortedDates.map(date => {
                const dateExceptions = groupedExceptions[date];
                const isPast = isDateInPast(date);

                return (
                  <div
                    key={date}
                    className={`border rounded-xl p-3 ${
                      isPast ? 'border-gray-300 bg-gray-50' : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(date)}
                        </h4>
                        {dateExceptions[0].event_name && (
                          <p className="text-xs text-blue-700 font-semibold mt-1">
                            {dateExceptions[0].event_name}
                          </p>
                        )}
                      </div>
                      {isPast && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          Przeszłość
                        </span>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-2 w-8"></th>
                            <th className="text-left py-2 px-2">Godzina</th>
                            <th className="text-left py-2 px-2">Tytuł</th>
                            <th className="text-left py-2 px-2">Czas</th>
                            <th className="text-right py-2 px-2">Akcje</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dateExceptions.map(exc => (
                            <tr key={exc.id} className="border-b border-gray-100 hover:bg-white">
                              <td className="py-2 px-2">
                                <button
                                  onClick={() => toggleException(exc.id)}
                                  className="text-purple-600 hover:text-purple-800"
                                >
                                  {selectedExceptions.has(exc.id) ? (
                                    <CheckSquare className="w-4 h-4" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>
                              </td>
                              <td className="py-2 px-2 font-semibold text-gray-900">
                                {formatTime(exc.time)}
                              </td>
                              <td className="py-2 px-2 text-gray-700">{exc.title}</td>
                              <td className="py-2 px-2 text-gray-600 text-xs">
                                {exc.duration_minutes} min
                              </td>
                              <td className="py-2 px-2">
                                <div className="flex gap-1 justify-end">
                                  <button
                                    onClick={() => {
                                      setEditingException(exc);
                                      setEventDate(exc.date);
                                      setEventName(exc.event_name || '');
                                      setMassEntries([{
                                        time: exc.time,
                                        title: exc.title,
                                        duration_minutes: exc.duration_minutes,
                                      }]);
                                      setIsModalOpen(true);
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(exc.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingException ? 'Edytuj wyjątek' : 'Dodaj wyjątki'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Data
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nazwa wydarzenia (opcjonalnie)
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="np. Boże Ciało, Odpust parafialny"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {!editingException && (
            <>
              <div className="border-t border-gray-200 pt-3 pb-3 space-y-2">
                <p className="text-sm font-semibold text-gray-700 mb-2">Szybkie dodawanie godzin (przez przecinek):</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bulkTimeInput}
                    onChange={(e) => setBulkTimeInput(e.target.value)}
                    placeholder="np. 08:00, 10:00, 12:00, 18:00"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleBulkTimeInput}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 text-sm whitespace-nowrap"
                  >
                    Dodaj
                  </button>
                </div>
                <p className="text-xs text-gray-500 italic">
                  Wpisz godziny oddzielone przecinkami lub średnikami
                </p>
              </div>

              <div className="border-b border-gray-200 pb-3 space-y-2">
                <p className="text-sm font-semibold text-gray-700 mb-2">Szybki import harmonogramu:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => importSchedule('sunday')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 border border-blue-200 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Niedziela
                  </button>
                  <button
                    type="button"
                    onClick={() => importSchedule('weekday')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg font-semibold hover:bg-green-100 border border-green-200 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Powszednie
                  </button>
                </div>
                <p className="text-xs text-gray-500 italic">
                  Import wypełni pola poniżej - możesz je edytować przed zapisem
                </p>
              </div>
            </>
          )}

          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Nabożeństwa
              </label>
              {!editingException && (
                <button
                  type="button"
                  onClick={addMassEntry}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded-lg font-semibold hover:bg-green-100 border border-green-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Dodaj kolejną mszę
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {massEntries.map((entry, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                    {!editingException && massEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMassEntry(index)}
                        className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Godzina
                      </label>
                      <input
                        type="time"
                        value={entry.time}
                        onChange={(e) => updateMassEntry(index, 'time', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Czas (min)
                      </label>
                      <input
                        type="number"
                        value={entry.duration_minutes}
                        onChange={(e) => updateMassEntry(index, 'duration_minutes', parseInt(e.target.value))}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Tytuł
                    </label>
                    <input
                      type="text"
                      value={entry.title}
                      onChange={(e) => updateMassEntry(index, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
          >
            {editingException ? 'Zapisz zmiany' : `Dodaj ${massEntries.filter(e => e.time).length} nabożeństw`}
          </button>
        </form>
      </Modal>

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
}
