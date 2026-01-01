
import React, { useState, useMemo } from 'react';
import { Incident, Kitchen, TaskStatus, IncidentCause } from '../types';
import { SELLERS, INSTALLERS, TASK_STATUSES } from '../constants';
import IncidentRegistrationForm from './IncidentRegistrationForm';
import KitchenRegistrationForm from './KitchenRegistrationForm';
import TaskList from './TaskList';

interface TasksProps {
  kitchens: Kitchen[];
  incidents: Incident[];
  onAddKitchen: (kitchen: Omit<Kitchen, 'id'>) => void;
  onAddIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateIncident: (incidentId: string, updates: Partial<Incident>) => void;
}

const Tasks: React.FC<TasksProps> = ({ kitchens, incidents, onAddKitchen, onAddIncident, onUpdateIncident }) => {
  const [selectedSeller, setSelectedSeller] = useState<string>('');
  const [selectedInstaller, setSelectedInstaller] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [filterLogistics, setFilterLogistics] = useState<boolean>(false);
  const [hideCompleted, setHideCompleted] = useState<boolean>(true);

  const filteredIncidents = useMemo(() => {
    return incidents
      .filter(incident => {
        const matchesSeller = selectedSeller ? incident.assignedToSeller === selectedSeller : true;
        const matchesInstaller = selectedInstaller ? incident.assignedToInstaller === selectedInstaller : true;
        const matchesStatus = selectedStatus ? incident.status === selectedStatus : true;
        const matchesLogistics = filterLogistics ? incident.cause === IncidentCause.LOGISTICS : true;
        const matchesCompleted = hideCompleted ? incident.status !== TaskStatus.COMPLETED : true;
        return matchesSeller && matchesInstaller && matchesStatus && matchesLogistics && matchesCompleted;
      })
      .sort((a, b) => {
        const kitchenA = kitchens.find(k => k.id === a.kitchenId);
        const kitchenB = kitchens.find(k => k.id === b.kitchenId);
        if (!kitchenA || !kitchenB) return 0;
        return new Date(kitchenA.installationDate).getTime() - new Date(kitchenB.installationDate).getTime();
      });
  }, [incidents, selectedSeller, selectedInstaller, selectedStatus, filterLogistics, hideCompleted, kitchens]);

  // Resumen de carga lateral
  const pendingIncidents = incidents.filter(i => i.status !== TaskStatus.COMPLETED);
  
  const sellerLoad = useMemo(() => {
    return SELLERS.map(s => ({
      name: s,
      count: pendingIncidents.filter(i => i.assignedToSeller === s).length
    })).sort((a, b) => b.count - a.count);
  }, [pendingIncidents]);

  const installerLoad = useMemo(() => {
    return INSTALLERS.map(inst => ({
      name: inst,
      count: pendingIncidents.filter(i => i.assignedToInstaller === inst).length
    })).sort((a, b) => b.count - a.count);
  }, [pendingIncidents]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
           <KitchenRegistrationForm onAddKitchen={onAddKitchen} />
        </div>
        <div>
           <IncidentRegistrationForm kitchens={kitchens} onAddIncident={onAddIncident} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lista Principal */}
        <div className="flex-grow bg-white p-8 rounded-[3rem] shadow-sm border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Seguimiento de Gestiones</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Lista dinámica de tareas activas</p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <button 
                onClick={() => setHideCompleted(!hideCompleted)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${hideCompleted ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}
              >
                {hideCompleted ? '👁️ Ocultando Completadas' : '👁️ Mostrando Todo'}
              </button>
              
              <select
                className="bg-gray-50 border-2 border-gray-100 rounded-xl p-2 text-[9px] font-black uppercase outline-none focus:border-emerald-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Estado: Todos</option>
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <TaskList
            incidents={filteredIncidents}
            kitchens={kitchens}
            onUpdateIncident={onUpdateIncident}
          />
        </div>

        {/* Sidebar de Resumen */}
        <div className="lg:w-80 shrink-0 space-y-6">
          <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-emerald-400">Carga por Vendedor</h3>
            <div className="space-y-4">
              {sellerLoad.map(item => (
                <div key={item.name} className="flex justify-between items-center group">
                  <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{item.name}</span>
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${item.count > 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-500'}`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-blue-600">Carga por Instalador</h3>
            <div className="space-y-4">
              {installerLoad.map(item => (
                <div key={item.name} className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-600">{item.name}</span>
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${item.count > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-300'}`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100">
             <div className="text-center">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Cocinas Activas</p>
                <p className="text-3xl font-black text-emerald-900 leading-none">
                  {new Set(pendingIncidents.map(i => i.kitchenId)).size}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
