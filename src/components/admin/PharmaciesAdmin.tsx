import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Pharmacy, PharmacyHours } from '../../lib/types';
import { Modal } from '../Modal';
import { Pencil, Trash, Plus, Clock } from 'lucide-react';

export function PharmaciesAdmin() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null);
  const [editingPharmacyHours, setEditingPharmacyHours] = useState<Pharmacy | null>(null);
  const [pharmacyHours, setPharmacyHours] = useState<PharmacyHours[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    is_priority_duty: false,
    info_note: '',
  });
  const [hoursFormData, setHoursFormData] = useState<{
    [key: string]: { open_time: string; close_time: string; is_closed: boolean };
  }>({
    weekday: { open_time: '08:00', close_time: '20:00', is_closed: false },
    saturday: { open_time: '08:00', close_time: '15:00', is_closed: false },
    sunday: { open_time: '', close_time: '', is_closed: true },
    holiday: { open_time: '', close_time: '', is_closed: true },
  });

  useEffect(() => {
    loadPharmacies();
  }, []);

  async function loadPharmacies() {
    const { data } = await supabase
      .from('pharmacies')
      .select('*')
      .order('name');
    if (data) setPharmacies(data);
  }

  function openAddModal() {
    setEditingPharmacy(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      is_priority_duty: false,
      info_note: '',
    });
    setIsModalOpen(true);
  }

  function openEditModal(pharmacy: Pharmacy) {
    setEditingPharmacy(pharmacy);
    setFormData({
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone || '',
      is_priority_duty: pharmacy.is_priority_duty,
      info_note: pharmacy.info_note || '',
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    try {
      let result;
      if (editingPharmacy) {
        result = await supabase
          .from('pharmacies')
          .update(formData)
          .eq('id', editingPharmacy.id);
      } else {
        result = await supabase.from('pharmacies').insert(formData);
      }

      if (result.error) {
        throw result.error;
      }

      setIsModalOpen(false);
      loadPharmacies();
    } catch (error: any) {
      console.error('Błąd zapisywania apteki:', error);
      setErrorMessage(
        `Nie udało się zapisać apteki: ${error.message || 'Nieznany błąd'}. ` +
        `Sprawdź czy masz uprawnienia administratora.`
      );
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Czy na pewno chcesz usunąć tę aptekę?')) {
      setErrorMessage('');
      try {
        const { error } = await supabase.from('pharmacies').delete().eq('id', id);
        if (error) throw error;
        loadPharmacies();
      } catch (error: any) {
        console.error('Błąd usuwania apteki:', error);
        setErrorMessage(
          `Nie udało się usunąć apteki: ${error.message || 'Nieznany błąd'}. ` +
          `Sprawdź czy masz uprawnienia administratora.`
        );
      }
    }
  }

  async function openHoursModal(pharmacy: Pharmacy) {
    setEditingPharmacyHours(pharmacy);

    const { data } = await supabase
      .from('pharmacy_hours')
      .select('*')
      .eq('pharmacy_id', pharmacy.id);

    if (data) {
      setPharmacyHours(data);
      const hoursMap: typeof hoursFormData = {
        weekday: { open_time: '08:00', close_time: '20:00', is_closed: false },
        saturday: { open_time: '08:00', close_time: '15:00', is_closed: false },
        sunday: { open_time: '', close_time: '', is_closed: true },
        holiday: { open_time: '', close_time: '', is_closed: true },
      };

      data.forEach(hour => {
        hoursMap[hour.day_type] = {
          open_time: hour.open_time || '',
          close_time: hour.close_time || '',
          is_closed: hour.is_closed,
        };
      });

      setHoursFormData(hoursMap);
    }

    setIsHoursModalOpen(true);
  }

  async function handleHoursSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPharmacyHours) return;
    setErrorMessage('');

    try {
      const deleteResult = await supabase
        .from('pharmacy_hours')
        .delete()
        .eq('pharmacy_id', editingPharmacyHours.id);

      if (deleteResult.error) throw deleteResult.error;

      const hoursToInsert = Object.entries(hoursFormData).map(([day_type, data]) => ({
        pharmacy_id: editingPharmacyHours.id,
        day_type,
        open_time: data.is_closed ? null : data.open_time,
        close_time: data.is_closed ? null : data.close_time,
        is_closed: data.is_closed,
      }));

      const insertResult = await supabase.from('pharmacy_hours').insert(hoursToInsert);

      if (insertResult.error) throw insertResult.error;

      setIsHoursModalOpen(false);
      loadPharmacies();
    } catch (error: any) {
      console.error('Błąd zapisywania godzin otwarcia:', error);
      setErrorMessage(
        `Nie udało się zapisać godzin otwarcia: ${error.message || 'Nieznany błąd'}. ` +
        `Sprawdź czy masz uprawnienia administratora.`
      );
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Apteki</h3>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Dodaj aptekę
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">Błąd zapisu</p>
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {pharmacies.map(pharmacy => (
          <div
            key={pharmacy.id}
            className="border border-gray-200 rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <h4 className="font-semibold text-gray-900">{pharmacy.name}</h4>
              <p className="text-sm text-gray-600">{pharmacy.address}</p>
              {pharmacy.phone && (
                <p className="text-sm text-gray-500">{pharmacy.phone}</p>
              )}
              {pharmacy.is_priority_duty && (
                <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                  Apteka dyżurna
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openHoursModal(pharmacy)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                title="Edytuj godziny pracy"
              >
                <Clock className="w-4 h-4" />
              </button>
              <button
                onClick={() => openEditModal(pharmacy)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Edytuj aptekę"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(pharmacy.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                title="Usuń aptekę"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPharmacy ? 'Edytuj aptekę' : 'Dodaj aptekę'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nazwa
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Adres
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Dodatkowa informacja
            </label>
            <input
              type="text"
              value={formData.info_note}
              onChange={(e) => setFormData({ ...formData, info_note: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              placeholder="np. Okienko nocne"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_priority_duty}
              onChange={(e) => setFormData({ ...formData, is_priority_duty: e.target.checked })}
              className="w-4 h-4 text-green-600 rounded"
            />
            <label className="text-sm font-semibold text-gray-700">
              Apteka dyżurna (całodobowa)
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
            >
              {editingPharmacy ? 'Zapisz' : 'Dodaj'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isHoursModalOpen}
        onClose={() => setIsHoursModalOpen(false)}
        title={`Godziny pracy - ${editingPharmacyHours?.name || ''}`}
      >
        <form onSubmit={handleHoursSubmit} className="space-y-4">
          {Object.entries(hoursFormData).map(([dayType, data]) => {
            const dayLabels: { [key: string]: string } = {
              weekday: 'Dni robocze (Pn-Pt)',
              saturday: 'Sobota',
              sunday: 'Niedziela',
              holiday: 'Święta',
            };

            return (
              <div key={dayType} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900">
                    {dayLabels[dayType]}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={data.is_closed}
                      onChange={(e) =>
                        setHoursFormData({
                          ...hoursFormData,
                          [dayType]: { ...data, is_closed: e.target.checked },
                        })
                      }
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm text-gray-600">Zamknięte</span>
                  </div>
                </div>

                {!data.is_closed && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Otwarcie</label>
                      <input
                        type="time"
                        value={data.open_time}
                        onChange={(e) =>
                          setHoursFormData({
                            ...hoursFormData,
                            [dayType]: { ...data, open_time: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        required={!data.is_closed}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Zamknięcie</label>
                      <input
                        type="time"
                        value={data.close_time}
                        onChange={(e) =>
                          setHoursFormData({
                            ...hoursFormData,
                            [dayType]: { ...data, close_time: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        required={!data.is_closed}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsHoursModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
            >
              Zapisz godziny
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
