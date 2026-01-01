
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { v4 as uuidv4 } from 'uuid';
import { Kitchen, Incident, TaskStatus, IncidentCause } from './types';
import { SELLERS, INSTALLERS } from './constants';

// Componentes internos
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import KitchenList from './components/KitchenList';
import FilteredListModal from './components/FilteredListModal';

const SCRIPT_URL = 'https://gonzalezjavier.com/Incidencias/backend/api.php';

const App = () => {
  const [currentTab, setCurrentTab] = useState('Portada');
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [isLoading, setIsLoading] = useState(true);
  const [drilldownFilter, setDrilldownFilter] = useState<{type: 'seller' | 'installer', label: string} | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [kRes, iRes] = await Promise.all([
        fetch(`${SCRIPT_URL}?action=getKitchens`).then(r => r.json()),
        fetch(`${SCRIPT_URL}?action=getIncidents`).then(r => r.json())
      ]);
      
      const parsedIncidents = (iRes || []).map((inc: any) => {
        let history = [];
        if (inc.history && typeof inc.history === 'string' && inc.history.trim() !== '' && inc.history !== 'NULL') {
          try {
            const parsed = JSON.parse(inc.history);
            history = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            history = [];
          }
        }
        
        return {
          ...inc,
          history: history.length === 0 && inc.observation ? [{
            text: inc.observation,
            date: inc.createdAt || new Date().toISOString(),
            statusAtTime: inc.status || TaskStatus.PENDING
          }] : history
        };
      });

      setKitchens(kRes || []);
      setIncidents(parsedIncidents);
    } catch (e) {
      console.error("Error cargando datos:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredKitchens = useMemo(() => {
    return kitchens.filter(k => {
      const d = new Date(k.installationDate);
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const y = d.getFullYear().toString();
      return (selectedMonth ? m === selectedMonth : true) && (selectedYear ? y === selectedYear : true);
    });
  }, [kitchens, selectedMonth, selectedYear]);

  const filteredIncidents = useMemo(() => {
    const kitchenIds = new Set(filteredKitchens.map(k => k.id));
    return incidents.filter(i => kitchenIds.has(i.kitchenId));
  }, [incidents, filteredKitchens]);

  const getSummary = (list: string[], type: 'seller' | 'installer') => list.map(label => {
    const ks = filteredKitchens.filter(k => type === 'seller' ? k.seller === label : k.installer === label);
    const targetCause = type === 'seller' ? IncidentCause.SELLER : IncidentCause.INSTALLER;
    const totalSpecificIncidents = filteredIncidents.filter(i => i.cause === targetCause && (type === 'seller' ? i.assignedToSeller === label : i.assignedToInstaller === label || ks.some(k => k.id === i.kitchenId)));
    const totalKitchens = ks.length;
    const incidentsCount = totalSpecificIncidents.length;
    return { label, totalKitchens, incidents: incidentsCount, incidencePercentage: totalKitchens > 0 ? (incidentsCount / totalKitchens) * 100 : 0 };
  });

  const sellerSummary = useMemo(() => getSummary(SELLERS, 'seller'), [filteredKitchens, filteredIncidents]);
  const installerSummary = useMemo(() => getSummary(INSTALLERS, 'installer'), [filteredKitchens, filteredIncidents]);

  const handleAddKitchen = async (newKitchen: Omit<Kitchen, 'id'>) => {
    setIsLoading(true);
    try {
      const payload = { kitchenData: { id: uuidv4(), ...newKitchen } };
      await fetch(`${SCRIPT_URL}?action=addKitchen`, { method: 'POST', body: JSON.stringify(payload) });
      await loadData();
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleAddIncident = async (newInc: any) => {
    setIsLoading(true);
    try {
      const payload = { incidentData: { 
        id: uuidv4(), 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(), 
        ...newInc,
        history: JSON.stringify(newInc.history || [])
      } };
      await fetch(`${SCRIPT_URL}?action=addIncident`, { method: 'POST', body: JSON.stringify(payload) });
      await loadData();
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleUpdateIncident = async (id: string, updates: any) => {
    setIsLoading(true);
    try {
      const formattedUpdates = { ...updates };
      if (updates.history && Array.isArray(updates.history) && updates.history.length > 0) {
        formattedUpdates.observation = updates.history[updates.history.length - 1].text;
        formattedUpdates.history = JSON.stringify(updates.history);
      }
      const payload = { incidentId: id, updates: { ...formattedUpdates, updatedAt: new Date().toISOString() } };
      await fetch(`${SCRIPT_URL}?action=updateIncident`, { method: 'POST', body: JSON.stringify(payload) });
      await loadData();
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-emerald-900 text-white p-8 shadow-2xl border-b-4 border-emerald-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter leading-none">LEROY MERLIN</h1>
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Kitchen Intelligence System</p>
          </div>
          <div className="flex gap-4">
            <select className="bg-emerald-950 border-2 border-emerald-800 rounded-2xl p-3 text-[10px] font-black uppercase outline-none focus:border-emerald-500" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
              <option value="">Todos los Meses</option>
              {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => <option key={m} value={m}>Mes {m}</option>)}
            </select>
            <select className="bg-emerald-950 border-2 border-emerald-800 rounded-2xl p-3 text-[10px] font-black uppercase outline-none focus:border-emerald-500" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              {['2024','2025','2026'].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </header>

      <nav className="bg-white p-5 border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-center gap-4">
          {['Portada', 'Tareas', 'Relación Proyectos'].map(tab => (
            <button key={tab} onClick={() => setCurrentTab(tab)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${currentTab === tab ? 'bg-emerald-600 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}>
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-grow p-8 md:p-12 max-w-7xl mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Sincronizando Sistema...</p>
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
                onOpenDrilldown={(type, label) => setDrilldownFilter({type, label})}
                onNavigateToTasks={() => setCurrentTab('Tareas')}
              />
            )}
            {currentTab === 'Tareas' && (
              <Tasks 
                kitchens={kitchens} 
                incidents={filteredIncidents} 
                onAddKitchen={handleAddKitchen} 
                onAddIncident={handleAddIncident} 
                onUpdateIncident={handleUpdateIncident} 
              />
            )}
            {currentTab === 'Relación Proyectos' && (
              <KitchenList 
                kitchens={filteredKitchens} 
                incidents={incidents} 
              />
            )}
          </>
        )}
      </main>

      {drilldownFilter && (
        <FilteredListModal 
          filter={drilldownFilter} 
          allKitchens={filteredKitchens} 
          allIncidents={filteredIncidents} 
          onClose={() => setDrilldownFilter(null)} 
        />
      )}
      <footer className="p-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.5em] border-t bg-white">
        © 2025 LEROY MERLIN - KITCHEN INTELLIGENCE SYSTEM
      </footer>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
