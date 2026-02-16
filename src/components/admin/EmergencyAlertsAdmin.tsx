import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal } from '../Modal';
import { EmergencyAlert } from '../../lib/types';
import { Pencil, Trash, Plus, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export function EmergencyAlertsAdmin() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<EmergencyAlert | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    message: '',
    is_active: false,
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    const { data } = await supabase
      .from('emergency_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setAlerts(data);
    }
  }

  function openAddModal() {
    setEditingAlert(null);
    setFormData({
      message: '',
      is_active: false,
    });
    setIsModalOpen(true);
  }

  function openEditModal(alert: EmergencyAlert) {
    setEditingAlert(alert);
    setFormData({
      message: alert.message,
      is_active: alert.is_active,
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    try {
      let result;
      if (editingAlert) {
        result = await supabase
          .from('emergency_alerts')
          .update(formData)
          .eq('id', editingAlert.id);
      } else {
        result = await supabase.from('emergency_alerts').insert(formData);
      }

      if (result.error) {
        throw result.error;
      }

      setIsModalOpen(false);
      loadAlerts();
    } catch (error: any) {
      console.error('Błąd zapisywania alertu:', error);
      setErrorMessage(
        `Nie udało się zapisać alertu: ${error.message || 'Nieznany błąd'}. ` +
        `Sprawdź czy masz uprawnienia administratora.`
      );
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Czy na pewno chcesz usunąć ten alert?')) {
      setErrorMessage('');
      try {
        const { error } = await supabase.from('emergency_alerts').delete().eq('id', id);
        if (error) throw error;
        loadAlerts();
      } catch (error: any) {
        console.error('Błąd usuwania alertu:', error);
        setErrorMessage(
          `Nie udało się usunąć alertu: ${error.message || 'Nieznany błąd'}. ` +
          `Sprawdź czy masz uprawnienia administratora.`
        );
      }
    }
  }

  async function toggleActive(alert: EmergencyAlert) {
    setErrorMessage('');
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({ is_active: !alert.is_active })
        .eq('id', alert.id);
      if (error) throw error;
      loadAlerts();
    } catch (error: any) {
      console.error('Błąd zmiany statusu alertu:', error);
      setErrorMessage(
        `Nie udało się zmienić statusu: ${error.message || 'Nieznany błąd'}. ` +
        `Sprawdź czy masz uprawnienia administratora.`
      );
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Alerty awaryjne</h3>
          <p className="text-sm text-gray-500">{alerts.length} alertów</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Dodaj alert
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
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
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-xl p-4 ${
              alert.is_active ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      alert.is_active ? 'text-amber-600' : 'text-gray-400'
                    }`}
                  />
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      alert.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {alert.is_active ? 'AKTYWNY' : 'NIEAKTYWNY'}
                  </span>
                </div>
                <p className="text-gray-900 font-medium mb-2">{alert.message}</p>
                <p className="text-xs text-gray-500">
                  Utworzono: {new Date(alert.created_at).toLocaleString('pl-PL')}
                </p>
                {alert.updated_at !== alert.created_at && (
                  <p className="text-xs text-gray-500">
                    Zaktualizowano: {new Date(alert.updated_at).toLocaleString('pl-PL')}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(alert)}
                  className={`p-2 rounded-lg ${
                    alert.is_active
                      ? 'text-orange-600 hover:bg-orange-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={alert.is_active ? 'Ukryj na stronie' : 'Pokaż na stronie'}
                >
                  {alert.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEditModal(alert)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Edytuj"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Usuń"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Brak alertów awaryjnych</p>
            <p className="text-sm text-gray-400 mt-1">Kliknij "Dodaj alert" aby utworzyć pierwszy</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAlert ? 'Edytuj alert awaryjny' : 'Dodaj alert awaryjny'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Treść komunikatu
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="np. Zmiana godzin otwarcia urzędu w dniu 25.12.2026"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Wiadomość będzie widoczna na górze strony gdy alert jest aktywny
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label className="text-sm font-semibold text-gray-700">
              Pokaż na stronie (aktywny)
            </label>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-sm text-amber-800">
              <strong>Uwaga:</strong> Po włączeniu tej opcji, alert będzie widoczny dla wszystkich
              użytkowników na górze strony głównej jako przyklejony baner.
            </p>
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              {editingAlert ? 'Zapisz' : 'Dodaj'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
