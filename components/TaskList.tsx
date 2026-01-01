
import React, { useState } from 'react';
import { Incident, TaskStatus, Kitchen, ObservationEntry } from '../types';
import { USER_LDAP_MAP } from '../constants';

interface TaskListProps {
  incidents: Incident[];
  kitchens: Kitchen[];
  onUpdateIncident: (incidentId: string, updates: Partial<Incident>) => void;
}

const TaskList: React.FC<TaskListProps> = ({ incidents, kitchens, onUpdateIncident }) => {
  const [newNote, setNewNote] = useState<{ [key: string]: string }>({});
  const [noteLdap, setNoteLdap] = useState<{ [key: string]: string }>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getKitchenDetails = (kitchenId: string) => {
    return kitchens.find(k => k.id === kitchenId);
  };

  const handleAddObservation = (incident: Incident) => {
    const noteText = newNote[incident.id]?.trim();
    const ldap = noteLdap[incident.id]?.trim();
    const user = ldap ? USER_LDAP_MAP[ldap] : null;

    if (!noteText || !user) {
      alert('Se requiere una nota y un LDAP válido.');
      return;
    }

    const currentHistory = Array.isArray(incident.history) ? incident.history : [];
    const updatedHistory: ObservationEntry[] = [
      ...currentHistory,
      {
        text: noteText,
        date: new Date().toISOString(),
        statusAtTime: incident.status,
        authorLdap: ldap,
        authorName: user.name
      }
    ];

    onUpdateIncident(incident.id, { 
      history: updatedHistory,
      updatedAt: new Date().toISOString()
    });

    setNewNote({ ...newNote, [incident.id]: '' });
    setNoteLdap({ ...noteLdap, [incident.id]: '' });
  };

  const handleUpdateStatus = (incident: Incident, newStatus: TaskStatus) => {
    onUpdateIncident(incident.id, { 
      status: newStatus, 
      updatedAt: new Date().toISOString() 
    });
  };

  if (incidents.length === 0) {
    return (
      <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No hay gestiones pendientes con los filtros actuales</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => {
        const kitchen = getKitchenDetails(incident.kitchenId);
        if (!kitchen) return null;

        const isExpanded = expandedId === incident.id;
        const history = Array.isArray(incident.history) ? incident.history : [];
        const latestNote = history.length > 0 ? history[history.length - 1] : null;

        return (
          <div key={incident.id} className={`bg-white rounded-3xl border transition-all ${isExpanded ? 'border-emerald-500 shadow-xl' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}>
            {/* Header / Fila de Lista */}
            <div 
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : incident.id)}
            >
              <div className="flex items-center gap-4">
                 <div className={`w-3 h-3 rounded-full ${incident.status === TaskStatus.COMPLETED ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`}></div>
                 <div>
                    <h3 className="text-sm font-black text-gray-900">{kitchen.orderNumber}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{kitchen.clientName}</p>
                 </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                 <span className="text-[8px] font-black px-2 py-1 rounded bg-gray-100 text-gray-500 uppercase tracking-widest">
                   {incident.cause}
                 </span>
                 <span className={`text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest ${incident.status === TaskStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-700'}`}>
                   {incident.status}
                 </span>
                 <div className="text-[8px] font-bold text-gray-400">
                    ÚLTIMA: {latestNote ? new Date(latestNote.date).toLocaleDateString() : 'N/A'}
                 </div>
                 <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                 </div>
              </div>
            </div>

            {/* Detalle Expandido */}
            {isExpanded && (
              <div className="p-8 pt-0 border-t border-gray-50 bg-gray-50/30 rounded-b-3xl animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                  {/* Info e Histórico */}
                  <div className="space-y-6">
                    <div>
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Descripción Técnica</span>
                       <p className="text-xs font-bold text-gray-700 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">{incident.description}</p>
                    </div>

                    <div>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Cronograma de Notas</span>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {history.map((h, i) => (
                          <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 text-[10px]">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-black text-gray-800">{h.authorName}</span>
                              <span className="text-[7px] text-gray-400">{new Date(h.date).toLocaleString()}</span>
                            </div>
                            <p className="italic text-gray-600">"{h.text}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="bg-white p-6 rounded-[2rem] border shadow-sm self-start space-y-5">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 mb-2">Nueva Acción</h4>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={noteLdap[incident.id] || ''}
                          onChange={(e) => setNoteLdap({ ...noteLdap, [incident.id]: e.target.value })}
                          placeholder="Tu LDAP"
                          className={`w-full border-2 rounded-xl p-3 text-[10px] font-bold outline-none transition-all ${USER_LDAP_MAP[noteLdap[incident.id]] ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 focus:border-emerald-200'}`}
                        />
                      </div>
                      <textarea
                        value={newNote[incident.id] || ''}
                        onChange={(e) => setNewNote({ ...newNote, [incident.id]: e.target.value })}
                        placeholder="Describe la gestión realizada..."
                        className="w-full border-2 border-gray-100 rounded-xl p-3 text-[10px] font-bold text-gray-700 outline-none focus:border-emerald-500 min-h-[80px] bg-gray-50 focus:bg-white transition-all"
                      />
                      
                      <button
                        onClick={() => handleAddObservation(incident)}
                        className="w-full bg-gray-900 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all"
                      >
                        Registrar Nota
                      </button>
                    </div>

                    <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleUpdateStatus(incident, TaskStatus.IN_PROGRESS)}
                        className={`py-3 rounded-xl text-[9px] font-black uppercase transition-all ${incident.status === TaskStatus.IN_PROGRESS ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400 hover:text-blue-600'}`}
                      >
                        Gestionando
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(incident, TaskStatus.COMPLETED)}
                        className="bg-emerald-600 text-white py-3 rounded-xl text-[9px] font-black uppercase hover:bg-emerald-700 transition-all"
                      >
                        Finalizar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
