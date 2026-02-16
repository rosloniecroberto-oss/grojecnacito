import { supabase } from './supabase';

export function generateDeviceFingerprint(): string {
  const nav = window.navigator;
  const screen = window.screen;

  const fingerprint = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
  ].join('|');

  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return `fp_${Math.abs(hash).toString(36)}`;
}

export async function canReportDelay(scheduleId: string): Promise<{
  canReport: boolean;
  reason?: string;
}> {
  const deviceFingerprint = generateDeviceFingerprint();
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('bus_delay_reports')
    .select('*')
    .eq('bus_schedule_id', scheduleId)
    .eq('device_fingerprint', deviceFingerprint)
    .gte('reported_at', fifteenMinutesAgo)
    .maybeSingle();

  if (error) {
    console.error('Error checking report eligibility:', error);
    return { canReport: true };
  }

  if (data) {
    return {
      canReport: false,
      reason: 'Już zgłosiłeś opóźnienie dla tego kursu w ciągu ostatnich 15 minut'
    };
  }

  return { canReport: true };
}

export async function submitDelayReport(scheduleId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const eligibility = await canReportDelay(scheduleId);

  if (!eligibility.canReport) {
    return {
      success: false,
      message: eligibility.reason || 'Nie można zgłosić opóźnienia'
    };
  }

  const deviceFingerprint = generateDeviceFingerprint();

  const { error } = await supabase
    .from('bus_delay_reports')
    .insert({
      bus_schedule_id: scheduleId,
      device_fingerprint: deviceFingerprint,
      reported_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error submitting delay report:', error);
    return {
      success: false,
      message: 'Wystąpił błąd podczas zgłaszania opóźnienia'
    };
  }

  return {
    success: true,
    message: 'Dziękujemy! Twoje zgłoszenie pomaga innym pasażerom.'
  };
}

export async function getDelayReportsCount(scheduleId: string): Promise<number> {
  await cleanupOldReports();

  const { data, error, count } = await supabase
    .from('bus_delay_reports')
    .select('*', { count: 'exact', head: false })
    .eq('bus_schedule_id', scheduleId);

  if (error) {
    console.error('Error getting delay reports count:', error);
    return 0;
  }

  return count || 0;
}

export async function cleanupOldReports(): Promise<void> {
  const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  await supabase
    .from('bus_delay_reports')
    .delete()
    .lt('reported_at', sixtyMinutesAgo);
}

export async function cleanupAllReports(): Promise<void> {
  await supabase
    .from('bus_delay_reports')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
}

export async function clearReportsForSchedule(scheduleId: string): Promise<void> {
  await supabase
    .from('bus_delay_reports')
    .delete()
    .eq('bus_schedule_id', scheduleId);
}

export function scheduleMidnightCleanup() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
    cleanupAllReports();
    setInterval(() => {
      cleanupAllReports();
    }, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
}
