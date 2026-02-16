import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EmergencyAlert } from '../lib/types';

export function EmergencyBanner() {
  const [alert, setAlert] = useState<EmergencyAlert | null>(null);

  useEffect(() => {
    loadActiveAlert();

    const channel = supabase
      .channel('emergency_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_alerts',
        },
        () => {
          loadActiveAlert();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadActiveAlert() {
    const { data } = await supabase
      .from('emergency_alerts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setAlert(data);
  }

  if (!alert) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{alert.message}</p>
        </div>
      </div>
    </div>
  );
}
