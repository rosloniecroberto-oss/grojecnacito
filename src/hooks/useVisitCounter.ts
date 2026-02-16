import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getPolishDate } from '../lib/polishTime';

export function useVisitCounter() {
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('visited');

    if (!hasVisited) {
      incrementVisitCount();
      sessionStorage.setItem('visited', 'true');
    }
  }, []);
}

async function incrementVisitCount() {
  try {
    const { data: existing } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'visit_count')
      .maybeSingle();

    const currentCount = existing ? parseInt(existing.value, 10) : 0;
    const newCount = currentCount + 1;

    await supabase
      .from('admin_settings')
      .upsert({
        key: 'visit_count',
        value: newCount.toString(),
        updated_at: getPolishDate().toISOString(),
      });
  } catch (error) {
    console.error('Error incrementing visit count:', error);
  }
}

export async function getVisitCount(): Promise<number> {
  try {
    const { data } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'visit_count')
      .maybeSingle();

    return data ? parseInt(data.value, 10) : 0;
  } catch (error) {
    console.error('Error fetching visit count:', error);
    return 0;
  }
}
