import { AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Banner {
  message: string;
  type: 'info' | 'warning' | 'success';
}

export function SmartBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    loadBanner();
  }, []);

  async function loadBanner() {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'smart_banner')
        .maybeSingle();

      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value);
          setBanner(parsed);
        } catch {
          // Invalid JSON, ignore
        }
      }
    } catch (error) {
      console.error('Error loading banner:', error);
    }
  }

  if (!banner || !isVisible) return null;

  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  return (
    <div className={`${colors[banner.type]} border-b px-4 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{banner.message}</p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
