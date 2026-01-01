
import React, { useState, useMemo } from 'react';
import { Kitchen, Incident, TaskStatus, ObservationEntry } from '../types';

interface KitchenListProps {
  kitchens: Kitchen[];
  incidents: Incident[];
}

interface CombinedLogEntry extends ObservationEntry {
  incidentId: string;
  cause: string;
}

const KitchenList: React.FC<KitchenListProps> = ({ kitchens, incidents }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedKitchenId, setSelectedKitchenId] = useState<string | null>(null);

  const filteredKitchens = useMemo(() => {
    if (searchQuery.trim().length < 2) return kitchens;
    const q = searchQuery.toLowerCase();
    return kitchens.filter(k =>
      k.orderNumber.toLowerCase().includes(q) ||
      k.clientName.toLowerCase().includes(q) ||
      k.seller.toLowerCase().includes(q) ||
      k.installer.toLowerCase().includes(q) ||
      k.ldap.toLowerCase().includes(q)
    );
  }, [kitchens, searchQuery]);

  const selectedKitchen = useMemo(() => 
    kitchens.find(k => k.id === selectedKitchenId), 
    [kitchens, selectedKitchenId]
  );

  const unifiedTimeline = useMemo(() => {
    if (!selectedKitchenId) return [];
    
    const kIncidents = incidents.filter(i => i.kitchenId === selectedKitchenId);
    let allEntries: CombinedLogEntry[] = [];
    
    kIncidents.forEach(inc => {
      const history = Array.isArray(inc.history) ? inc.history : [];
      if (history.length === 0 && inc.observation) {
        allEntries.push({
          text: inc.observation,
          date: inc.createdAt,
          statusAtTime: inc.status,
          incidentId: inc.id,
          cause: inc.cause,
          authorLdap: 'Legacy',
          authorName: 'Histórico'
        });
      } else {
        history.forEach(h => {
          allEntries.push({
            ...h,
            incidentId: inc.id,
            cause: inc.cause
          });
        });
      }
    });

    return allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incidents, selectedKitchenId]);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border">
        <input
          type="text"
          className="w-full border-2 border-gray-100 rounded-3xl p-6 font-bold text-gray-700 outline-none focus:border-emerald-500 transition-all text-lg shadow-inner"
          placeholder="Buscar por Pedido, Cliente, LDAP o Profesional..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {selectedKitchen && (
        <div className="bg-white rounded-[3rem] border-2 border-emerald-100 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <div className="p-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                  PROYECTO: <span className="text-emerald-600 font-mono">{selectedKitchen.orderNumber}</span>
                </h2>
                <div className="flex gap-4 mt-2">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CLIENTE: {selectedKitchen.clientName}</p>
                   <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">V: {selectedKitchen.seller} / I: {selectedKitchen.installer}</p>
                </div>
              </div>
              <button onClick={() => setSelectedKitchenId(null)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 font-black text-2xl">×</button>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b pb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Línea de Tiempo Unificada del Pedido
              </h3>
              
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-gray-100 before:to-transparent">
                {unifiedTimeline.map((entry, idx) => (
                  <div key={idx} className="relative flex items-start gap-8 group">
                    <div className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-white border-4 border-emerald-500 shadow-sm z-10 transition-transform group-hover:scale-110">
                      <span className="text-[8px] font-black text-emerald-600">{entry.authorName ? entry.authorName[0] : '?'}</span>
                    </div>
                    
                    <div className="ml-12 flex-grow bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{entry.authorName || 'Anónimo'}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                          <span className="text-[9px] font-black text-gray-400">{new Date(entry.date).toLocaleString()}</span>
                        </div>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${entry.statusAtTime === TaskStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {entry.statusAtTime}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-700 leading-relaxed italic">"{entry.text}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <tr>
              <th className="px-8 py-6 text-left">Pedido / LDAP</th>
              <th className="px-8 py-6 text-left">Cliente</th>
              <th className="px-8 py-6 text-left">Profesionales</th>
              <th className="px-8 py-6 text-center">Calidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs font-bold">
            {filteredKitchens.map((k) => {
              const kIncidents = incidents.filter(i => i.kitchenId === k.id);
              const activeIncidents = kIncidents.filter(i => i.status !== TaskStatus.COMPLETED);
              const isSelected = selectedKitchenId === k.id;
              
              return (
                <tr key={k.id} className={`transition-colors cursor-pointer group ${isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'}`} onClick={() => setSelectedKitchenId(k.id)}>
                  <td className="px-8 py-5">
                    <div className="text-emerald-700 font-mono font-black text-sm">{k.orderNumber}</div>
                    <div className="text-[9px] text-gray-300 uppercase tracking-tighter">{k.ldap}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-gray-800 uppercase">{k.clientName}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-[10px] text-gray-400 flex flex-col gap-1 uppercase">
                      <span><b className="text-gray-600">V:</b> {k.seller}</span>
                      <span><b className="text-gray-600">I:</b> {k.installer}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {activeIncidents.length > 0 ? (
                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] uppercase font-black animate-pulse">
                          ⚠️ {activeIncidents.length} GESTIÓN
                        </span>
                      ) : (
                        <span className="text-emerald-500 text-[10px] uppercase font-black">✓ PROYECTO OK</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KitchenList;
