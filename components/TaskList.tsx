
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
  const [showHistoryId, setShowHistoryId] = useState<string | null>(null);

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {incidents.map((incident) => {
        const kitchen = getKitchenDetails(incident.kitchenId);
        if (!kitchen) return null;

        const history = Array.isArray(incident.history) ? incident.history : [];
        const latestNote = history.length > 0 ? history[history.length - 1] : null;

        return (
          <div key={incident.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {incident.cause}
              </span>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${incident.status === TaskStatus.COMPLETED ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-700 animate-pulse'}`}>
                {incident.status}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-1">{kitchen.orderNumber}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kitchen.clientName}</p>
            </div>

            <div className="flex-grow space-y-4 mb-8">
              <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                <span className="text-[9px] font-black text-gray-400 uppercase block mb-2">Motivo Incidencia</span>
                <p className="text-xs font-bold text-gray-700 leading-relaxed">{incident.description}</p>
              </div>

              <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100/50 relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-emerald-600 uppercase">Última Gestión</span>
                  {latestNote && (
                    <span className="text-[8px] font-black text-emerald-400 uppercase">POR: {latestNote.authorName}</span>
                  )}
                </div>
                <p className="text-xs text-emerald-900 italic font-medium leading-relaxed">
                  {latestNote ? latestNote.text : "Pendiente de registro de notas..."}
                </p>
                <button 
                  onClick={() => setShowHistoryId(incident.id)}
                  className="absolute bottom-2 right-4 text-emerald-600/50 hover:text-emerald-600 text-[8px] font-black uppercase tracking-tighter underline"
                >
                  Histórico ({history.length})
                </button>
              </div>
            </div>

            {incident.status !== TaskStatus.COMPLETED && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteLdap[incident.id] || ''}
                    onChange={(e) => setNoteLdap({ ...noteLdap, [incident.id]: e.target.value })}
                    placeholder="Tu LDAP"
                    className={`w-1/3 border-2 rounded-2xl p-3 text-[10px] font-bold outline-none transition-all ${USER_LDAP_MAP[noteLdap[incident.id]] ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100'}`}
                  />
                  <textarea
                    value={newNote[incident.id] || ''}
                    onChange={(e) => setNewNote({ ...newNote, [incident.id]: e.target.value })}
                    placeholder="Añadir nueva observación..."
                    className="w-2/3 border-2 border-gray-100 rounded-2xl p-3 text-[10px] font-bold text-gray-700 outline-none focus:border-emerald-500 min-h-[60px] bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAddObservation(incident)}
                    className="col-span-2 bg-gray-900 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                  >
                    Registrar Nota
                  </button>
                  
                  <button
                    onClick={() => handleUpdateStatus(incident, TaskStatus.IN_PROGRESS)}
                    className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${incident.status === TaskStatus.IN_PROGRESS ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`}
                  >
                    Gestionando
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(incident, TaskStatus.COMPLETED)}
                    className="bg-emerald-600 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                  >
                    Completada
                  </button>
                </div>
              </div>
            )}
            
            {incident.status === TaskStatus.COMPLETED && (
              <div className="flex flex-col items-center gap-2 pt-4 border-t border-gray-50">
                <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">✓ OK - Finalizado</span>
                <button 
                  onClick={() => setShowHistoryId(incident.id)}
                  className="text-gray-400 hover:text-emerald-600 font-black text-[8px] uppercase tracking-widest underline"
                >
                  Ver Auditoría de Gestión
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Modal de Historial de Notas */}
      {showHistoryId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-8 bg-gray-50 border-b flex justify-between items-center">
              <div>
                <h4 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Registro Histórico</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Audit Trail de Seguimiento</p>
              </div>
              <button onClick={() => setShowHistoryId(null)} className="text-3xl font-black text-gray-300 hover:text-red-500">×</button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              {incidents.find(i => i.id === showHistoryId)?.history?.map((entry, idx) => (
                <div key={idx} className="flex gap-6 items-start group">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                    <div className="w-0.5 h-full bg-gray-100 group-last:bg-transparent min-h-[40px]"></div>
                  </div>
                  <div className="flex-grow pb-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-900 uppercase">{entry.authorName || 'Sistema'}</span>
                        <span className="text-[7px] text-gray-400 font-bold">{new Date(entry.date).toLocaleString()}</span>
                      </div>
                      <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">{entry.statusAtTime}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-700 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm italic">"{entry.text}"</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 border-t bg-gray-50 text-right">
              <button onClick={() => setShowHistoryId(null)} className="bg-gray-900 text-white px-10 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
