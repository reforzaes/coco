
import React, { useMemo } from 'react';
import { Incident, TaskStatus } from '../types';
import { SELLERS, INSTALLERS } from '../constants';

interface ResolutionSpeedAnalysisProps {
  incidents: Incident[];
}

const ResolutionSpeedAnalysis: React.FC<ResolutionSpeedAnalysisProps> = ({ incidents }) => {
  const completedIncidents = incidents.filter(i => i.status === TaskStatus.COMPLETED && i.createdAt && i.updatedAt);

  const getAverageTime = (professional: string, type: 'seller' | 'installer') => {
    const list = completedIncidents.filter(i => 
      type === 'seller' ? i.assignedToSeller === professional : i.assignedToInstaller === professional
    );
    
    if (list.length === 0) return null;

    const totalMs = list.reduce((acc, curr) => {
      const created = new Date(curr.createdAt).getTime();
      const updated = new Date(curr.updatedAt).getTime();
      return acc + (updated - created);
    }, 0);

    const avgMs = totalMs / list.length;
    return avgMs / (1000 * 60 * 60 * 24); // Convertir a días
  };

  const sellerStats = useMemo(() => {
    return SELLERS.map(s => ({
      name: s,
      avgDays: getAverageTime(s, 'seller')
    })).filter(s => s.avgDays !== null).sort((a, b) => (a.avgDays || 0) - (b.avgDays || 0));
  }, [completedIncidents]);

  const installerStats = useMemo(() => {
    return INSTALLERS.map(inst => ({
      name: inst,
      avgDays: getAverageTime(inst, 'installer')
    })).filter(i => i.avgDays !== null).sort((a, b) => (a.avgDays || 0) - (b.avgDays || 0));
  }, [completedIncidents]);

  return (
    <div className="bg-white p-10 rounded-[3.5rem] border shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-4">
          <span className="w-4 h-4 bg-emerald-900 rounded-full"></span>
          Eficiencia de Resolución
        </h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Tiempo medio entre apertura y cierre (Días)</p>
      </div>

      <div className="space-y-10">
        <div>
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-6 border-b pb-2">Vendedores (Agilidad)</h3>
           <div className="space-y-4">
             {sellerStats.length > 0 ? sellerStats.map(s => (
               <div key={s.name} className="space-y-1">
                 <div className="flex justify-between text-[10px] font-black uppercase">
                   <span className="text-gray-600">{s.name}</span>
                   <span className="text-emerald-700">{s.avgDays?.toFixed(1)} días</span>
                 </div>
                 <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((s.avgDays || 0) * 10, 100)}%` }}
                    ></div>
                 </div>
               </div>
             )) : <p className="text-[10px] text-gray-300 uppercase font-bold italic">No hay datos de resolución todavía</p>}
           </div>
        </div>

        <div>
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6 border-b pb-2">Instaladores (Agilidad)</h3>
           <div className="space-y-4">
             {installerStats.length > 0 ? installerStats.map(inst => (
               <div key={inst.name} className="space-y-1">
                 <div className="flex justify-between text-[10px] font-black uppercase">
                   <span className="text-gray-600">{inst.name}</span>
                   <span className="text-blue-700">{inst.avgDays?.toFixed(1)} días</span>
                 </div>
                 <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((inst.avgDays || 0) * 10, 100)}%` }}
                    ></div>
                 </div>
               </div>
             )) : <p className="text-[10px] text-gray-300 uppercase font-bold italic">No hay datos de resolución todavía</p>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResolutionSpeedAnalysis;
