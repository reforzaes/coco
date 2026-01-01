
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import KitchenList from './components/KitchenList';
import MonthYearFilter from './components/MonthYearFilter';
import FilteredListModal from './components/FilteredListModal';
import { Kitchen, Incident, TaskStatus, IncidentCause } from './types';
import { SELLERS, INSTALLERS } from './constants';

const SCRIPT_URL = 'https://gonzalezjavier.com/Incidencias/backend/api.php'; 

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('Portada');
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Drilldown state para la ventana emergente
  const [drilldownFilter, setDrilldownFilter] = useState<{type: 'seller' | 'installer', label: string} | null>(null);

  const fetchGoogleSheetData = useCallback(async (action: string, method: 'GET' | 'POST', payload?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `${SCRIPT_URL}?action=${action}`;
      let options: RequestInit = { method };

      if (method === 'POST' && payload) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(payload);
      } else if (method === 'GET' && payload) {
        const params = new URLSearchParams();
        params.append('data', JSON.stringify(payload));
        url = `${url}&${params.toString()}`;
      }

      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    const fetchedKitchens = await fetchGoogleSheetData('getKitchens', 'GET');
    const fetchedIncidents = await fetchGoogleSheetData('getIncidents', 'GET');
    if (fetchedKitchens) setKitchens(fetchedKitchens);
    if (fetchedIncidents) setIncidents(fetchedIncidents);
  }, [fetchGoogleSheetData]);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const filteredKitchens = useMemo(() => {
    return kitchens.filter(kitchen => {
      const d = new Date(kitchen.installationDate);
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const y = d.getFullYear().toString();
      return (selectedMonth ? m === selectedMonth : true) && (selectedYear ? y === selectedYear : true);
    });
  }, [kitchens, selectedMonth, selectedYear]);

  const filteredIncidents = useMemo(() => {
    const kitchenIds = new Set(filteredKitchens.map(k => k.id));
    return incidents.filter(i => kitchenIds.has(i.kitchenId));
  }, [incidents, filteredKitchens]);

  const sellerSummary = useMemo(() => SELLERS.map(label => {
    const ks = filteredKitchens.filter(k => k.seller === label);
    const ins = filteredIncidents.filter(i => i.assignedToSeller === label || (ks.some(k => k.id === i.kitchenId) && i.cause === IncidentCause.SELLER));
    return { label, totalKitchens: ks.length, incidents: ins.length, incidencePercentage: ks.length ? (ins.length / ks.length) * 100 : 0 };
  }), [filteredKitchens, filteredIncidents]);

  const installerSummary = useMemo(() => INSTALLERS.map(label => {
    const ks = filteredKitchens.filter(k => k.installer === label);
    const ins = filteredIncidents.filter(i => i.assignedToInstaller === label || (ks.some(k => k.id === i.kitchenId) && i.cause === IncidentCause.INSTALLER));
    return { label, totalKitchens: ks.length, incidents: ins.length, incidencePercentage: ks.length ? (ins.length / ks.length) * 100 : 0 };
  }), [filteredKitchens, filteredIncidents]);

  const handleOpenDrilldown = (type: 'seller' | 'installer', label: string) => {
    setDrilldownFilter({ type, label });
  };

  // Reusable handlers for data mutations
  const handleAddKitchen = async (k: Omit<Kitchen, 'id'>) => {
    const res = await fetchGoogleSheetData('addKitchen', 'POST', { kitchenData: { id: uuidv4(), ...k } });
    if (res) loadAllData();
  };

  const handleAddIncident = async (i: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await fetchGoogleSheetData('addIncident', 'POST', { 
      incidentData: { 
        id: uuidv4(), 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(), 
        ...i 
      } 
    });
    if (res) loadAllData();
  };

  const handleUpdateIncident = async (id: string, u: Partial<Incident>) => {
    const res = await fetchGoogleSheetData('updateIncident', 'POST', { incidentId: id, updates: u });
    if (res) loadAllData();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-emerald-100">
      <header className="bg-emerald-900 text-white p-6 shadow-2xl border-b-4 border-emerald-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">LEROY MERLIN</h1>
            <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.3em]">Kitchen Project Analytics</p>
          </div>
          <MonthYearFilter
            selectedMonth={selectedMonth} onMonthChange={setSelectedMonth}
            selectedYear={selectedYear} onYearChange={setSelectedYear}
            availableYears={[2024, 2025, 2026]}
          />
        </div>
      </header>

      <nav className="bg-white p-4 border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-center">
          <Navigation currentTab={currentTab} onTabChange={setCurrentTab} tabs={['Portada', 'Tareas a Realizar', 'Listado de Cocinas']} />
        </div>
      </nav>
      
      <main className="flex-grow">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-14 h-14 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="font-black text-gray-300 uppercase tracking-[0.2em] text-[10px]">Sincronizando Sistema...</p>
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto my-20 p-8 bg-red-50 border-2 border-red-100 rounded-3xl text-center">
            <h2 className="text-red-800 font-black uppercase tracking-tighter mb-2">Error de Sistema</h2>
            <p className="text-red-600 text-sm font-bold">{error}</p>
          </div>
        ) : (
          <>
            {currentTab === 'Portada' && (
              <Dashboard
                kitchens={filteredKitchens}
                incidents={filteredIncidents} 
                sellerSummary={sellerSummary}
                installerSummary={installerSummary}
                onAddKitchen={handleAddKitchen}
                onOpenDrilldown={handleOpenDrilldown}
              />
            )}
            {currentTab === 'Tareas a Realizar' && (
              <Tasks
                kitchens={filteredKitchens} 
                incidents={filteredIncidents}
                onAddKitchen={handleAddKitchen}
                onAddIncident={handleAddIncident}
                onUpdateIncident={handleUpdateIncident}
              />
            )}
            {currentTab === 'Listado de Cocinas' && <KitchenList kitchens={filteredKitchens} incidents={filteredIncidents} />}
          </>
        )}
      </main>

      {/* El modal se renderiza fuera de los condicionales de tab para estar disponible globalmente */}
      {drilldownFilter && (
        <FilteredListModal
          filter={drilldownFilter}
          allKitchens={filteredKitchens}
          allIncidents={filteredIncidents}
          onClose={() => setDrilldownFilter(null)}
        />
      )}

      <footer className="bg-white p-10 border-t text-center">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">© 2025 LEROY MERLIN - KITCHEN INTELLIGENCE SYSTEM</p>
      </footer>
    </div>
  );
};

export default App;
