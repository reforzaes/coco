
import React, { useMemo, useState } from 'react';
import { Kitchen, Incident, TaskStatus, IncidentCause } from '../types';

interface FilteredListModalProps {
  filter: { type: 'seller' | 'installer'; label: string } | null;
  allKitchens: Kitchen[];
  allIncidents: Incident[];
  onClose: () => void;
}

const FilteredListModal: React.FC<FilteredListModalProps> = ({ filter, allKitchens, allIncidents, onClose }) => {
  const [selectedOrderHistory, setSelectedOrderHistory] = useState<string | null>(null);
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

  const kitchens = useMemo(() => {
    if (!filter) return [];
    return allKitchens.filter(k => filter.type === 'seller' ? k.seller === filter.label : k.installer === filter.label);
  }, [allKitchens, filter]);

  const activeIncidentsForStats = useMemo(() => {
    if (!filter || kitchens.length === 0) return [];
    const kitchenIds = new Set(kitchens.map(k => k.id));
    
    return allIncidents.filter(i => {
      if (i.status === TaskStatus.COMPLETED) return false;
      if (filter.type === 'seller') {
        return i.assignedToSeller === filter.label || (kitchenIds.has(i.kitchenId) && i.cause === IncidentCause.SELLER);
      } else {
        return i.assignedToInstaller === filter.label || (kitchenIds.has(i.kitchenId) && i.cause === IncidentCause.INSTALLER);
      }
    });
  }, [allIncidents, kitchens, filter]);

  const stats = useMemo(() => {
    if (!filter || kitchens.length === 0) return { total: 0, ratio: 0, activeCount: 0 };
    const total = kitchens.length;
    const activeCount = activeIncidentsForStats.length;
    return {
      total,
      activeCount,
      ratio: total > 0 ? (activeCount / total) * 100 : 0
    };
  }, [kitchens, activeIncidentsForStats, filter]);

  if (!filter) return null;

  const getIncidentsForKitchen = (kitchenId: string) => {
    return allIncidents.filter(i => i.kitchenId === kitchenId);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                {filter.label} 
                <span className="ml-4 text-emerald-600 bg-emerald-100 px-4 py-1 rounded-full text-[10px] align-middle font-black tracking-widest">
                  {filter.type === 'seller' ? 'VENDEDOR' : 'INSTALADOR'}
                </span>
              </h2>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] mt-2">Base de Datos de Rendimiento Operativo</p>
            </div>
            
            <div className="flex gap-4 border-l-0 md:border-l-2 md:pl-6 border-gray-200">
              <div className="flex flex-col text-center">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cocinas</span>
                <span className="text-xl font-black text-emerald-700">{stats.total}</span>
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pendientes</span>
                <span className={`text-xl font-black ${stats.ratio > 0 ? 'text-red-600' : 'text-emerald-500'}`}>
                  {stats.activeCount} ({stats.ratio.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all text-3xl font-black">×</button>
        </div>
        
        <div className="p-10 overflow-y-auto space-y-8">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-6 flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
              Estado de Calidad por Proyecto
            </h3>
            <div className="border-2 border-gray-50 rounded-[2.5rem] overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-50 text-sm">
                <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  <tr>
                    <th className="px-8 py-5 text-left">Pedido / LDAP</th>
                    <th className="px-8 py-5 text-left">Cliente</th>
                    <th className="px-8 py-5 text-center">Calidad</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {kitchens.map(k => {
                    const kitchenIncidents = getIncidentsForKitchen(k.id);
                    const activeKitchenIncidents = kitchenIncidents.filter(i => i.status !== TaskStatus.COMPLETED);
                    const hasActive = activeKitchenIncidents.length > 0;
                    const isExpanded = selectedOrderHistory === k.id;

                    return (
                      <React.Fragment key={k.id}>
                        <tr className={`transition-colors ${isExpanded ? 'bg-emerald-50/50' : 'hover:bg-gray-50'}`}>
                          <td className="px-8 py-5">
                            <div className="font-black text-emerald-700 font-mono">{k.orderNumber}</div>
                            <div className="text-[9px] text-gray-400 font-black uppercase">{k.ldap}</div>
                          </td>
                          <td className="px-8 py-5 text-gray-700 font-bold uppercase">{k.clientName}</td>
                          <td className="px-8 py-5 text-center">
                            {hasActive ? (
                              <button onClick={() => setSelectedOrderHistory(isExpanded ? null : k.id)} className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all shadow-sm ${isExpanded ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                                ⚠️ {activeKitchenIncidents.length} Gestión
                              </button>
                            ) : (
                              <div className="flex items-center justify-center gap-4">
                                <span className="text-emerald-500 font-black text-[10px] uppercase">✓ OK</span>
                                {kitchenIncidents.length > 0 && <button onClick={() => setSelectedOrderHistory(isExpanded ? null : k.id)} className="text-blue-400 hover:text-blue-600 font-black text-[9px] uppercase tracking-tighter">[Ver Notas]</button>}
                              </div>
                            )}
                          </td>
                        </tr>
                        
                        {isExpanded && (
                          <tr key={`detail-${k.id}`}>
                            <td colSpan={3} className="px-8 py-6 bg-emerald-50/30">
                              <div className="bg-white rounded-[2rem] p-6 border-2 border-emerald-100 shadow-inner animate-in slide-in-from-top-2 duration-300">
                                <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-4 border-b border-emerald-100 pb-2">Hilos de Gestión del Proyecto</h4>
                                <div className="space-y-4">
                                  {kitchenIncidents.map(incident => {
                                    const history = incident.history || [];
                                    const notesExpanded = expandedNotesId === incident.id;
                                    
                                    return (
                                      <div key={incident.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="flex justify-between items-start mb-3">
                                          <span className="text-[9px] font-black text-white uppercase bg-gray-900 px-2 py-0.5 rounded">{incident.cause}</span>
                                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${incident.status === TaskStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{incident.status}</span>
                                        </div>
                                        <div className="mb-4">
                                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Motivo Original</span>
                                          <p className="text-xs text-gray-700 font-bold leading-relaxed">{incident.description}</p>
                                        </div>
                                        
                                        <div className="space-y-2 border-t border-gray-200 pt-3">
                                          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block">Observaciones de Seguimiento</span>
                                          {(notesExpanded ? history : history.slice(-1)).map((h, i) => (
                                            <div key={i} className="flex flex-col bg-white p-3 rounded-xl border border-emerald-100 text-[10px]">
                                              <div className="flex justify-between items-center mb-1">
                                                <span className="text-gray-400 font-black">{h.date ? new Date(h.date).toLocaleString() : 'Sin fecha'}</span>
                                                <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black uppercase text-[7px]">{h.statusAtTime}</span>
                                              </div>
                                              <p className="italic text-gray-600 font-medium">{h.text}</p>
                                            </div>
                                          ))}
                                          {history.length > 1 && (
                                            <button 
                                              onClick={() => setExpandedNotesId(notesExpanded ? null : incident.id)} 
                                              className="mt-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-md transition-all"
                                            >
                                              {notesExpanded ? '[-] Contraer' : `[+] Ver ${history.length - 1} más`}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        
        <div className="p-8 border-t bg-gray-50 text-right">
          <button onClick={onClose} className="bg-gray-900 text-white font-black px-16 py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-xl">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default FilteredListModal;
