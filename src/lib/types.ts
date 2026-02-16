export type DayType = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'holiday';

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone?: string;
  is_priority_duty: boolean;
  info_note?: string;
}

export interface PharmacyHours {
  id: string;
  pharmacy_id: string;
  day_type: DayType;
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
}

export interface WasteArea {
  id: string;
  type: 'city' | 'village';
  name: string;
  zone?: string;
}

export interface WasteSchedule {
  id: string;
  area_id: string;
  waste_type: 'mixed' | 'plastic' | 'paper' | 'glass' | 'green' | 'christmas_trees' | 'bulky' | 'ash' | 'textiles';
  collection_date: string;
}

export type DaysFilterType = 'WORKDAYS' | 'SATURDAYS' | 'SUNDAYS_HOLIDAYS' | 'WORKDAYS,SATURDAYS' | 'WORKDAYS,SUNDAYS_HOLIDAYS' | 'SATURDAYS,SUNDAYS_HOLIDAYS' | 'WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS';

export interface BusSchedule {
  id: string;
  route_type: 'PKS' | 'BUSY';
  destination: string;
  via?: string;
  departure_time: string;
  days_filter: string; // WORKDAYS, SATURDAYS, SUNDAYS_HOLIDAYS lub kombinacje
  symbols?: string; // Symbole z PDF: D, S, M, C, Ca, pmh, d, 6, 7G, itp.
  is_cancelled: boolean;
}

export interface BusReport {
  id: string;
  schedule_id: string;
  report_type: 'delay' | 'missing';
  report_date: string;
  report_count: number;
}

export interface Parish {
  id: string;
  name: string;
  address?: string;
  google_place_id?: string;
  navigation_link?: string;
}

export interface MassSchedule {
  id: string;
  parish_id: string;
  day_type: DayType;
  time: string;
  title?: string;
  is_periodic: boolean;
  duration_minutes: number;
}

export interface MassScheduleException {
  id: string;
  parish_id: string;
  date: string;
  time: string;
  title: string;
  event_name?: string;
  duration_minutes: number;
  created_at?: string;
}

export interface EventOverride {
  id: string;
  event_date: string;
  module_type: 'mass' | 'pharmacy' | 'bus' | 'waste';
  title: string;
  description?: string;
  data?: any;
}

export interface CalendarSettings {
  id: string;
  force_holiday_mode: boolean;
  force_break_mode: boolean;
  updated_at: string;
}

export interface EmergencyAlert {
  id: string;
  message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}
