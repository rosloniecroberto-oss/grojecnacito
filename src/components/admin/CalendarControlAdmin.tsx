import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CalendarSettings } from '../../lib/types';
import { Calendar, AlertTriangle } from 'lucide-react';

export function CalendarControlAdmin() {
  const [settings, setSettings] = useState<CalendarSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data } = await supabase
        .from('calendar_settings')
        .select('*')
        .maybeSingle();

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading calendar settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateSetting(field: 'force_holiday_mode' | 'force_break_mode', value: boolean) {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from('calendar_settings')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', settings.id);

      if (!error) {
        setSettings({ ...settings, [field]: value });
      }
    } catch (error) {
      console.error('Error updating calendar settings:', error);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded-xl"></div>
          <div className="h-16 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Status Kalendarza</h3>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Furtka bezpieczeństwa</p>
            <p className="text-xs">
              Używaj tych przełączników, gdy przewoźnik wprowadzi zmiany niezgodne z oficjalnym kalendarzem.
              Ustawienia wpływają na widoczność kursów dla użytkowników.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">Tryb świąteczny/wolny</h4>
              <p className="text-xs text-gray-600 mt-1">
                Traktuj dzisiejszy dzień jako niedzielę/święto. Ukrywa kursy z symbolem D i S.
              </p>
            </div>
            <button
              onClick={() => updateSetting('force_holiday_mode', !settings?.force_holiday_mode)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                settings?.force_holiday_mode ? 'bg-red-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  settings?.force_holiday_mode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {settings?.force_holiday_mode && (
            <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700 font-semibold">
                AKTYWNY - Kursy D i S są ukryte przed użytkownikami
              </p>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">Tryb feryjny/wakacyjny</h4>
              <p className="text-xs text-gray-600 mt-1">
                Ignoruj daty systemowe i traktuj każdy dzień jako feryjny. Ukrywa kursy szkolne (S), pokazuje kursy M.
              </p>
            </div>
            <button
              onClick={() => updateSetting('force_break_mode', !settings?.force_break_mode)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                settings?.force_break_mode ? 'bg-orange-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  settings?.force_break_mode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {settings?.force_break_mode && (
            <div className="mt-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-700 font-semibold">
                AKTYWNY - Kursy szkolne (S) są ukryte, kursy M są widoczne
              </p>
            </div>
          )}
        </div>
      </div>

      {(settings?.force_holiday_mode || settings?.force_break_mode) && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <span className="font-semibold">Pamiętaj:</span> Wyłącz te tryby, gdy przewoźnik wróci do normalnego rozkładu jazdy.
          </p>
        </div>
      )}
    </div>
  );
}
