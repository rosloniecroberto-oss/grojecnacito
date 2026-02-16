import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BusSchedule } from '../../lib/types';
import { formatTime } from '../../lib/timeFormat';
import { parseSymbols } from '../../lib/courseLegend';
import { clearReportsForSchedule } from '../../lib/delayReports';
import { Modal } from '../Modal';
import {
  Pencil,
  Trash,
  Plus,
  Ban,
  AlertCircle,
  Trash2,
  Check,
  X,
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  List,
  Table2,
} from 'lucide-react';

interface BusScheduleWithReports extends BusSchedule {
  reportCount: number;
}

type SortField = 'departure_time' | 'destination' | 'route_type' | 'days_filter';
type SortDirection = 'asc' | 'desc';

export function BusesAdmin() {
  const [buses, setBuses] = useState<BusScheduleWithReports[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<BusScheduleWithReports[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<BusScheduleWithReports | null>(null);
  const [editingInline, setEditingInline] = useState<string | null>(null);
  const [selectedBuses, setSelectedBuses] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    destination: { enabled: false, value: '' },
    via: { enabled: false, value: '' },
    route_type: { enabled: false, value: 'PKS' as 'PKS' | 'BUSY' },
    symbols: { enabled: false, value: '' },
    days_filter: { enabled: false, value: '' },
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRouteType, setFilterRouteType] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [filterDestination, setFilterDestination] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('departure_time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [formData, setFormData] = useState({
    route_type: 'PKS' as 'PKS' | 'BUSY',
    destination: '',
    via: '',
    departure_time: '',
    days_filter: 'WORKDAYS',
    symbols: '',
    is_cancelled: false,
  });

  useEffect(() => {
    loadBuses();
    const refreshTimer = setInterval(() => {
      loadBuses();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshTimer);
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [buses, searchQuery, filterRouteType, filterDestination, sortField, sortDirection]);

  async function loadBuses() {
    const { data } = await supabase
      .from('bus_schedules')
      .select('*')
      .order('departure_time');

    const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: reportsData } = await supabase
      .from('bus_delay_reports')
      .select('bus_schedule_id')
      .gte('reported_at', sixtyMinutesAgo);

    if (data) {
      const reportCounts = new Map<string, number>();
      reportsData?.forEach(report => {
        const currentCount = reportCounts.get(report.bus_schedule_id) || 0;
        reportCounts.set(report.bus_schedule_id, currentCount + 1);
      });

      const combined = data.map(bus => ({
        ...bus,
        reportCount: reportCounts.get(bus.id) || 0,
      }));
      setBuses(combined);
    }
  }

  function applyFiltersAndSort() {
    let filtered = [...buses];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        bus =>
          bus.destination.toLowerCase().includes(query) ||
          bus.via?.toLowerCase().includes(query) ||
          bus.symbols?.toLowerCase().includes(query) ||
          bus.departure_time.includes(query)
      );
    }

    if (filterRouteType !== 'all') {
      filtered = filtered.filter(bus => bus.route_type === filterRouteType);
    }

    if (filterDestination !== 'all') {
      filtered = filtered.filter(bus => bus.destination === filterDestination);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'departure_time':
          comparison = a.departure_time.localeCompare(b.departure_time);
          break;
        case 'destination':
          comparison = a.destination.localeCompare(b.destination);
          break;
        case 'route_type':
          comparison = a.route_type.localeCompare(b.route_type);
          break;
        case 'days_filter':
          comparison = a.days_filter.localeCompare(b.days_filter);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredBuses(filtered);
    setCurrentPage(1);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  }

  function openAddModal() {
    setEditingBus(null);
    setFormData({
      route_type: 'PKS',
      destination: '',
      via: '',
      departure_time: '',
      days_filter: 'WORKDAYS',
      symbols: '',
      is_cancelled: false,
    });
    setIsModalOpen(true);
  }

  function openEditModal(bus: BusSchedule) {
    setEditingBus(bus);
    setFormData({
      route_type: bus.route_type,
      destination: bus.destination,
      via: bus.via || '',
      departure_time: bus.departure_time,
      days_filter: bus.days_filter,
      symbols: bus.symbols || '',
      is_cancelled: bus.is_cancelled,
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    try {
      let result;
      if (editingBus) {
        result = await supabase
          .from('bus_schedules')
          .update(formData)
          .eq('id', editingBus.id);
      } else {
        result = await supabase.from('bus_schedules').insert(formData);
      }

      if (result.error) {
        throw result.error;
      }

      setIsModalOpen(false);
      loadBuses();
    } catch (error: any) {
      console.error('Błąd zapisywania kursu:', error);
      setErrorMessage(
        `Nie udało się zapisać kursu: ${error.message || 'Nieznany błąd'}. ` +
        `Sprawdź czy masz uprawnienia administratora.`
      );
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Czy na pewno chcesz usunąć ten kurs?')) {
      setErrorMessage('');
      try {
        const { error } = await supabase.from('bus_schedules').delete().eq('id', id);
        if (error) throw error;
        loadBuses();
      } catch (error: any) {
        console.error('Błąd usuwania kursu:', error);
        setErrorMessage(
          `Nie udało się usunąć kursu: ${error.message || 'Nieznany błąd'}. ` +
          `Sprawdź czy masz uprawnienia administratora.`
        );
      }
    }
  }

  async function handleDeleteSelected() {
    if (selectedBuses.size === 0) return;
    if (
      !confirm(
        `Czy na pewno chcesz usunąć ${selectedBuses.size} zaznaczonych kursów?`
      )
    )
      return;

    setErrorMessage('');
    try {
      const { error } = await supabase
        .from('bus_schedules')
        .delete()
        .in('id', Array.from(selectedBuses));

      if (error) throw error;

      setSelectedBuses(new Set());
      loadBuses();
    } catch (error: any) {
      console.error('Błąd usuwania kursów:', error);
      setErrorMessage(
        `Nie udało się usunąć kursów: ${error.message || 'Nieznany błąd'}. ` +
        `Sprawdź czy masz uprawnienia administratora.`
      );
    }
  }

  function openBulkEditModal() {
    setBulkEditData({
      destination: { enabled: false, value: '' },
      via: { enabled: false, value: '' },
      route_type: { enabled: false, value: 'PKS' },
      symbols: { enabled: false, value: '' },
      days_filter: { enabled: false, value: '' },
    });
    setShowBulkEditModal(true);
  }

  async function handleBulkEdit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedBuses.size === 0) return;

    const updates: any = {};
    if (bulkEditData.destination.enabled) updates.destination = bulkEditData.destination.value;
    if (bulkEditData.via.enabled) updates.via = bulkEditData.via.value;
    if (bulkEditData.route_type.enabled) updates.route_type = bulkEditData.route_type.value;
    if (bulkEditData.symbols.enabled) updates.symbols = bulkEditData.symbols.value;
    if (bulkEditData.days_filter.enabled) updates.days_filter = bulkEditData.days_filter.value;

    if (Object.keys(updates).length === 0) {
      alert('Wybierz przynajmniej jedno pole do edycji');
      return;
    }

    setErrorMessage('');
    try {
      const { error } = await supabase
        .from('bus_schedules')
        .update(updates)
        .in('id', Array.from(selectedBuses));

      if (error) throw error;

      setShowBulkEditModal(false);
      setSelectedBuses(new Set());
      loadBuses();
    } catch (error: any) {
      console.error('Błąd masowej edycji:', error);
      setErrorMessage(
        `Nie udało się edytować kursów: ${error.message || 'Nieznany błąd'}. ` +
        `Sprawdź czy masz uprawnienia administratora.`
      );
    }
  }

  async function toggleCancelled(bus: BusScheduleWithReports) {
    await supabase
      .from('bus_schedules')
      .update({ is_cancelled: !bus.is_cancelled })
      .eq('id', bus.id);
    loadBuses();
  }

  async function clearReports(busId: string) {
    if (confirm('Czy na pewno chcesz wyczyścić wszystkie zgłoszenia dla tego kursu?')) {
      await clearReportsForSchedule(busId);
      loadBuses();
    }
  }

  function toggleSelectAll() {
    const pageIds = paginatedBuses.map(bus => bus.id);
    if (pageIds.every(id => selectedBuses.has(id))) {
      setSelectedBuses(new Set([...selectedBuses].filter(id => !pageIds.includes(id))));
    } else {
      setSelectedBuses(new Set([...selectedBuses, ...pageIds]));
    }
  }

  function toggleSelect(id: string) {
    const newSelected = new Set(selectedBuses);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBuses(newSelected);
  }

  function exportToCSV() {
    const headers = ['Typ', 'Kierunek', 'Godzina', 'Przez', 'Dni', 'Symbole', 'Odwołany'];
    const rows = filteredBuses.map(bus => [
      bus.route_type,
      bus.destination,
      bus.departure_time,
      bus.via || '',
      bus.days_filter,
      bus.symbols || '',
      bus.is_cancelled ? 'TAK' : 'NIE',
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rozkład-jazdy-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  const uniqueDestinations = [...new Set(buses.map(b => b.destination))].sort();
  const totalPages = Math.ceil(filteredBuses.length / itemsPerPage);
  const paginatedBuses = filteredBuses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Rozkład jazdy</h3>
          <p className="text-sm text-gray-500">
            {filteredBuses.length} z {buses.length} kursów
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Eksport CSV
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
          >
            {viewMode === 'table' ? <List className="w-4 h-4" /> : <Table2 className="w-4 h-4" />}
            {viewMode === 'table' ? 'Karty' : 'Tabela'}
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Dodaj kurs
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
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

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Szukaj po kierunku, trasie, symbolu lub godzinie..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={filterRouteType}
            onChange={e => setFilterRouteType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Wszystkie typy</option>
            <option value="PKS">PKS</option>
            <option value="BUSY">BUSY</option>
          </select>

          <select
            value={filterDestination}
            onChange={e => setFilterDestination(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Wszystkie kierunki</option>
            {uniqueDestinations.map(dest => (
              <option key={dest} value={dest}>
                {dest}
              </option>
            ))}
          </select>

          {selectedBuses.size > 0 && (
            <>
              <button
                onClick={openBulkEditModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                <Pencil className="w-4 h-4" />
                Edytuj zaznaczone ({selectedBuses.size})
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
              >
                <Trash className="w-4 h-4" />
                Usuń zaznaczone ({selectedBuses.size})
              </button>
            </>
          )}
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto overflow-y-visible" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left bg-gray-50 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <input
                      type="checkbox"
                      checked={paginatedBuses.every(bus => selectedBuses.has(bus.id))}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </th>
                  <th
                    onClick={() => handleSort('route_type')}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      Typ <SortIcon field="route_type" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('departure_time')}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      Godzina <SortIcon field="departure_time" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('destination')}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      Kierunek <SortIcon field="destination" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase whitespace-nowrap">
                    Przez
                  </th>
                  <th
                    onClick={() => handleSort('days_filter')}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      Dni <SortIcon field="days_filter" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase whitespace-nowrap">
                    Symbole
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase bg-gray-50 sticky right-0 z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedBuses.map(bus => (
                  <tr
                    key={bus.id}
                    className={`hover:bg-gray-50 ${
                      bus.is_cancelled ? 'bg-gray-50 opacity-60' : ''
                    }`}
                  >
                    <td className="px-4 py-3 bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <input
                        type="checkbox"
                        checked={selectedBuses.has(bus.id)}
                        onChange={() => toggleSelect(bus.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          bus.route_type === 'PKS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {bus.route_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-semibold text-gray-900">
                        {formatTime(bus.departure_time)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{bus.destination}</span>
                        {bus.is_cancelled && (
                          <span className="text-xs font-semibold text-red-600">ODWOŁANY</span>
                        )}
                        {bus.reportCount > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
                            <AlertCircle className="w-3 h-3" />
                            {bus.reportCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <div className="truncate" title={bus.via || '-'}>
                        {bus.via || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {bus.days_filter}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {bus.symbols || '-'}
                    </td>
                    <td className="px-4 py-3 bg-white sticky right-0 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <div className="flex justify-end gap-1">
                        {bus.reportCount > 0 && (
                          <button
                            onClick={() => clearReports(bus.id)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg flex-shrink-0"
                            title="Wyczyść zgłoszenia"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleCancelled(bus)}
                          className={`p-2 rounded-lg flex-shrink-0 ${
                            bus.is_cancelled
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-orange-600 hover:bg-orange-50'
                          }`}
                          title={bus.is_cancelled ? 'Przywróć' : 'Odwołaj'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(bus)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex-shrink-0"
                          title="Edytuj"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bus.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
                          title="Usuń"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Strona {currentPage} z {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Poprzednia
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Następna
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedBuses.map(bus => (
            <div
              key={bus.id}
              className={`border rounded-xl p-4 flex items-center justify-between ${
                bus.is_cancelled ? 'bg-gray-50 opacity-60' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedBuses.has(bus.id)}
                  onChange={() => toggleSelect(bus.id)}
                  className="w-4 h-4 text-blue-600 rounded mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        bus.route_type === 'PKS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {bus.route_type}
                    </span>
                    <span className="font-semibold text-gray-900">{bus.destination}</span>
                    {bus.is_cancelled && (
                      <span className="text-xs font-semibold text-red-600">ODWOŁANY</span>
                    )}
                    {bus.reportCount > 0 && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
                        <AlertCircle className="w-3 h-3" />
                        Zgłoszenia: {bus.reportCount}
                      </span>
                    )}
                  </div>
                  {bus.via && (
                    <p className="text-xs text-gray-500 mb-1">Przez: {bus.via}</p>
                  )}
                  {bus.symbols && (
                    <p className="text-xs text-gray-500 mb-1">
                      Symbole: {parseSymbols(bus.symbols).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Odjazd: {formatTime(bus.departure_time)} • {bus.days_filter}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {bus.reportCount > 0 && (
                  <button
                    onClick={() => clearReports(bus.id)}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                    title="Wyczyść zgłoszenia"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => toggleCancelled(bus)}
                  className={`p-2 rounded-lg ${
                    bus.is_cancelled
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-orange-600 hover:bg-orange-50'
                  }`}
                  title={bus.is_cancelled ? 'Przywróć' : 'Odwołaj'}
                >
                  <Ban className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEditModal(bus)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(bus.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBus ? 'Edytuj kurs' : 'Dodaj kurs'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Typ kursu
            </label>
            <select
              value={formData.route_type}
              onChange={e =>
                setFormData({ ...formData, route_type: e.target.value as 'PKS' | 'BUSY' })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="PKS">PKS</option>
              <option value="BUSY">BUSY</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Kierunek</label>
            <input
              type="text"
              value={formData.destination}
              onChange={e => setFormData({ ...formData, destination: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Przez (przystanki)
            </label>
            <input
              type="text"
              value={formData.via}
              onChange={e => setFormData({ ...formData, via: e.target.value })}
              placeholder="np. Warka, Pniewy, Chynów"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Opcjonalne - lista przystanków pośrednich</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Godzina odjazdu
            </label>
            <input
              type="time"
              value={formData.departure_time}
              onChange={e => setFormData({ ...formData, departure_time: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Dni kursowania
            </label>
            <select
              value={formData.days_filter}
              onChange={e => setFormData({ ...formData, days_filter: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="WORKDAYS">Dni robocze</option>
              <option value="SATURDAYS">Soboty</option>
              <option value="SUNDAYS_HOLIDAYS">Niedziele/Święta</option>
              <option value="WORKDAYS,SATURDAYS">Dni robocze + Soboty</option>
              <option value="WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS">Codziennie</option>
              <option value="SATURDAYS,SUNDAYS_HOLIDAYS">Soboty + Niedziele/Święta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Symbole kursowania
            </label>
            <input
              type="text"
              value={formData.symbols}
              onChange={e => setFormData({ ...formData, symbols: e.target.value })}
              placeholder="np. DU, SU, CdU"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Opcjonalne - symbole z rozkładu PKS</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_cancelled}
              onChange={e => setFormData({ ...formData, is_cancelled: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label className="text-sm font-semibold text-gray-700">Kurs odwołany</label>
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
              {editingBus ? 'Zapisz' : 'Dodaj'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        title={`Edycja masowa (${selectedBuses.size} kursów)`}
      >
        <form onSubmit={handleBulkEdit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-blue-800">
              Zaznacz pola, które chcesz zmienić. Niezaznaczone pola pozostaną bez zmian.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                checked={bulkEditData.destination.enabled}
                onChange={e =>
                  setBulkEditData({
                    ...bulkEditData,
                    destination: { ...bulkEditData.destination, enabled: e.target.checked },
                  })
                }
                className="w-5 h-5 text-blue-600 rounded mt-2"
              />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Kierunek
                </label>
                <input
                  type="text"
                  value={bulkEditData.destination.value}
                  onChange={e =>
                    setBulkEditData({
                      ...bulkEditData,
                      destination: { ...bulkEditData.destination, value: e.target.value },
                    })
                  }
                  disabled={!bulkEditData.destination.enabled}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="np. Warszawa"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                checked={bulkEditData.via.enabled}
                onChange={e =>
                  setBulkEditData({
                    ...bulkEditData,
                    via: { ...bulkEditData.via, enabled: e.target.checked },
                  })
                }
                className="w-5 h-5 text-blue-600 rounded mt-2"
              />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Przez (przystanki)
                </label>
                <input
                  type="text"
                  value={bulkEditData.via.value}
                  onChange={e =>
                    setBulkEditData({
                      ...bulkEditData,
                      via: { ...bulkEditData.via, value: e.target.value },
                    })
                  }
                  disabled={!bulkEditData.via.enabled}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="np. Warka, Pniewy, Chynów"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                checked={bulkEditData.route_type.enabled}
                onChange={e =>
                  setBulkEditData({
                    ...bulkEditData,
                    route_type: { ...bulkEditData.route_type, enabled: e.target.checked },
                  })
                }
                className="w-5 h-5 text-blue-600 rounded mt-2"
              />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Typ kursu
                </label>
                <select
                  value={bulkEditData.route_type.value}
                  onChange={e =>
                    setBulkEditData({
                      ...bulkEditData,
                      route_type: {
                        ...bulkEditData.route_type,
                        value: e.target.value as 'PKS' | 'BUSY',
                      },
                    })
                  }
                  disabled={!bulkEditData.route_type.enabled}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="PKS">PKS</option>
                  <option value="BUSY">BUSY</option>
                </select>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                checked={bulkEditData.days_filter.enabled}
                onChange={e =>
                  setBulkEditData({
                    ...bulkEditData,
                    days_filter: { ...bulkEditData.days_filter, enabled: e.target.checked },
                  })
                }
                className="w-5 h-5 text-blue-600 rounded mt-2"
              />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Dni kursowania
                </label>
                <select
                  value={bulkEditData.days_filter.value}
                  onChange={e =>
                    setBulkEditData({
                      ...bulkEditData,
                      days_filter: { ...bulkEditData.days_filter, value: e.target.value },
                    })
                  }
                  disabled={!bulkEditData.days_filter.enabled}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">Wybierz...</option>
                  <option value="WORKDAYS">Dni robocze</option>
                  <option value="SATURDAYS">Soboty</option>
                  <option value="SUNDAYS_HOLIDAYS">Niedziele/Święta</option>
                  <option value="WORKDAYS,SATURDAYS">Dni robocze + Soboty</option>
                  <option value="WORKDAYS,SATURDAYS,SUNDAYS_HOLIDAYS">Codziennie</option>
                  <option value="SATURDAYS,SUNDAYS_HOLIDAYS">Soboty + Niedziele/Święta</option>
                </select>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                checked={bulkEditData.symbols.enabled}
                onChange={e =>
                  setBulkEditData({
                    ...bulkEditData,
                    symbols: { ...bulkEditData.symbols, enabled: e.target.checked },
                  })
                }
                className="w-5 h-5 text-blue-600 rounded mt-2"
              />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Symbole kursowania
                </label>
                <input
                  type="text"
                  value={bulkEditData.symbols.value}
                  onChange={e =>
                    setBulkEditData({
                      ...bulkEditData,
                      symbols: { ...bulkEditData.symbols, value: e.target.value },
                    })
                  }
                  disabled={!bulkEditData.symbols.enabled}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="np. DU, SU, CdU"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setShowBulkEditModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Zapisz zmiany
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
