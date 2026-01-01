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

  const filteredIncidents = useMemo(() => {
    return incidents
      .filter(incident => {
        const matchesSeller = selectedSeller ? incident.assignedToSeller === selectedSeller : true;
        const matchesInstaller = selectedInstaller ? incident.assignedToInstaller === selectedInstaller : true;
        const matchesStatus = selectedStatus ? incident.status === selectedStatus : true;
        const matchesLogistics = filterLogistics ? incident.cause === IncidentCause.LOGISTICS : true;
        return matchesSeller && matchesInstaller && matchesStatus && matchesLogistics;
      })
      .sort((a, b) => {
        const kitchenA = kitchens.find(k => k.id === a.kitchenId);
        const kitchenB = kitchens.find(k => k.id === b.kitchenId);
        if (!kitchenA || !kitchenB) return 0;
        return new Date(kitchenA.installationDate).getTime() - new Date(kitchenB.installationDate).getTime();
      });
  }, [incidents, selectedSeller, selectedInstaller, selectedStatus, filterLogistics, kitchens]);

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

      <div className="bg-white p-10 rounded-[3rem] shadow-sm border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Seguimiento de Gestiones</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Filtrado Dinámico de Tareas Pendientes</p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <select
              className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-3 text-[10px] font-black uppercase outline-none focus:border-emerald-500 min-w-[150px]"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Estado: Todos</option>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            
            <button 
              onClick={() => setFilterLogistics(!filterLogistics)}
              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${filterLogistics ? 'bg-amber-500 text-white shadow-lg' : 'bg-gray-50 text-gray-400 border-2 border-gray-100'}`}
            >
              🚚 Logística
            </button>

            <select
              className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-3 text-[10px] font-black uppercase outline-none focus:border-emerald-500 min-w-[150px]"
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
            >
              <option value="">Vendedor: Todos</option>
              {SELLERS.map((seller) => (
                <option key={seller} value={seller}>{seller}</option>
              ))}
            </select>
            <select
              className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-3 text-[10px] font-black uppercase outline-none focus:border-emerald-500 min-w-[150px]"
              value={selectedInstaller}
              onChange={(e) => setSelectedInstaller(e.target.value)}
            >
              <option value="">Instalador: Todos</option>
              {INSTALLERS.map((installer) => (
                <option key={installer} value={installer}>{installer}</option>
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
    </div>
  );
};

export default Tasks;