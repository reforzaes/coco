
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Kitchen, Incident, IncidentCause, TaskStatus, ObservationEntry } from '../types';
import { INSTALLERS, SELLERS, INCIDENT_CAUSES, USER_LDAP_MAP } from '../constants';

interface IncidentRegistrationFormProps {
  kitchens: Kitchen[];
  onAddIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialKitchenId?: string;
}

const IncidentRegistrationForm: React.FC<IncidentRegistrationFormProps> = ({
  kitchens,
  onAddIncident,
  initialKitchenId,
}) => {
  const [authorLdap, setAuthorLdap] = useState<string>('');
  const [ldapSearch, setLdapSearch] = useState<string>('');
  const [showLdapResults, setShowLdapResults] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedKitchen, setSelectedKitchen] = useState<Kitchen | null>(null);
  const [description, setDescription] = useState<string>('');
  const [observation, setObservation] = useState<string>('');
  const [cause, setCause] = useState<IncidentCause>(IncidentCause.OTHER);
  const [assignedToSeller, setAssignedToSeller] = useState<string | null>(null);
  const [assignedToInstaller, setAssignedToInstaller] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ldapWrapperRef = useRef<HTMLDivElement>(null);

  const authorData = useMemo(() => USER_LDAP_MAP[authorLdap] || null, [authorLdap]);

  // Búsqueda de usuarios por nombre o LDAP
  const ldapSearchResults = useMemo(() => {
    if (ldapSearch.length < 2) return [];
    const search = ldapSearch.toLowerCase();
    return Object.entries(USER_LDAP_MAP).filter(([ldap, data]) => 
      data.name.toLowerCase().includes(search) || ldap.includes(search)
    ).map(([ldap, data]) => ({ ldap, ...data }));
  }, [ldapSearch]);

  // Si el LDAP es de un vendedor conocido, auto-asignamos la causa y el vendedor
  useEffect(() => {
    if (authorData && authorData.role === 'Vendedor') {
      setCause(IncidentCause.SELLER);
      setAssignedToSeller(authorData.name);
    }
  }, [authorData]);

  const filteredResults = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase();
    return kitchens.filter(k => 
      k.orderNumber.toLowerCase().includes(q) || 
      k.clientName.toLowerCase().includes(q) ||
      k.ldap.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [searchQuery, kitchens]);

  useEffect(() => {
    if (initialKitchenId) {
      const kitchen = kitchens.find(k => k.id === initialKitchenId);
      if (kitchen) selectKitchen(kitchen);
    }
  }, [initialKitchenId, kitchens]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (ldapWrapperRef.current && !ldapWrapperRef.current.contains(event.target as Node)) {
        setShowLdapResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectKitchen = (kitchen: Kitchen) => {
    setSelectedKitchen(kitchen);
    setSearchQuery(kitchen.orderNumber);
    if (!assignedToSeller) setAssignedToSeller(kitchen.seller);
    if (!assignedToInstaller) setAssignedToInstaller(kitchen.installer);
    setShowResults(false);
  };

  const handleSelectLdap = (ldap: string) => {
    setAuthorLdap(ldap);
    setLdapSearch(ldap);
    setShowLdapResults(false);
  };

  const resetForm = () => {
    setSearchQuery('');
    setSelectedKitchen(null);
    setDescription('');
    setObservation('');
    setAuthorLdap('');
    setLdapSearch('');
    setCause(IncidentCause.OTHER);
    setAssignedToSeller(null);
    setAssignedToInstaller(null);
    setShowResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorLdap || !authorData) {
      alert('Introduzca un LDAP válido para continuar.');
      return;
    }
    if (!selectedKitchen || !description || !cause) {
      alert('Por favor, complete la descripción y asegúrese de que una cocina esté seleccionada.');
      return;
    }

    const initialHistory: ObservationEntry[] = observation.trim() ? [{
      text: observation.trim(),
      date: new Date().toISOString(),
      statusAtTime: TaskStatus.PENDING,
      authorLdap: authorLdap,
      authorName: authorData.name
    }] : [];

    onAddIncident({
      kitchenId: selectedKitchen.id,
      description,
      observation: observation.trim(),
      history: initialHistory,
      status: TaskStatus.PENDING,
      assignedToSeller: cause === IncidentCause.SELLER ? (assignedToSeller || selectedKitchen.seller) : null,
      assignedToInstaller: cause === IncidentCause.INSTALLER ? (assignedToInstaller || selectedKitchen.installer) : null,
      cause,
    });
    resetForm();
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border mb-10">
      <h2 className="text-2xl font-black mb-6 text-gray-800 uppercase tracking-tighter">Registrar Incidencia o Gestión</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-1 relative" ref={ldapWrapperRef}>
            <label htmlFor="ldapSearchInc" className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Tu Identificación (Nombre o LDAP)</label>
            <div className="relative">
              <input
                type="text"
                id="ldapSearchInc"
                autoComplete="off"
                className={`w-full border-2 rounded-2xl p-4 font-bold text-gray-700 outline-none transition-all ${authorData ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 focus:border-emerald-200'}`}
                value={ldapSearch}
                onChange={(e) => {
                  setLdapSearch(e.target.value);
                  setShowLdapResults(true);
                  if (USER_LDAP_MAP[e.target.value]) setAuthorLdap(e.target.value);
                  else if (authorLdap) setAuthorLdap('');
                }}
                onFocus={() => setShowLdapResults(true)}
                placeholder="Busca por nombre..."
                required
              />
              {authorData && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
                  <span className="text-[10px] font-black text-emerald-600 uppercase leading-none">{authorData.name}</span>
                  <span className="text-[7px] text-emerald-400 font-bold uppercase">{authorData.role}</span>
                </div>
              )}
            </div>
            {showLdapResults && ldapSearchResults.length > 0 && (
              <div className="absolute z-[110] left-0 right-0 top-full mt-2 bg-white border-2 border-emerald-500 rounded-2xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                {ldapSearchResults.map((u) => (
                  <div 
                    key={u.ldap} 
                    onClick={() => handleSelectLdap(u.ldap)}
                    className="p-3 hover:bg-emerald-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center group"
                  >
                    <div className="flex flex-col">
                      <span className="font-black text-gray-800 text-xs group-hover:text-emerald-700">{u.name}</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase">{u.role}</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded">{u.ldap}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative md:col-span-1" ref={wrapperRef}>
            <label htmlFor="searchKitchen" className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
              Buscador de Cocina
            </label>
            <div className="relative">
              <input
                type="text"
                id="searchKitchen"
                autoComplete="off"
                className={`w-full border-2 rounded-2xl p-4 font-bold text-gray-700 focus:ring-4 focus:ring-emerald-100 outline-none transition-all ${
                  showResults && filteredResults.length > 0 ? 'border-emerald-500 shadow-lg' : 'border-gray-100'
                }`}
                value={searchQuery}
                onFocus={() => setShowResults(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                  if (selectedKitchen && e.target.value !== selectedKitchen.orderNumber) setSelectedKitchen(null);
                }}
                placeholder="Pedido, LDAP o Cliente..."
              />
            </div>

            {showResults && filteredResults.length > 0 && (
              <div className="absolute z-[100] w-full bg-white border-2 border-emerald-500 rounded-2xl mt-2 shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                {filteredResults.map((k) => (
                  <div key={k.id} onClick={() => selectKitchen(k)} className="p-4 hover:bg-emerald-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between group">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-emerald-700 text-sm group-hover:underline">{k.orderNumber}</span>
                        <span className="bg-gray-100 text-[9px] font-black px-1.5 py-0.5 rounded text-gray-400 uppercase">{k.ldap}</span>
                      </div>
                      <div className="text-xs font-bold text-gray-500 mt-0.5 uppercase">{k.clientName}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <label htmlFor="cause" className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Causa Principal</label>
            <select
              id="cause"
              className="w-full border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 focus:ring-4 focus:ring-emerald-100 outline-none appearance-none"
              value={cause}
              onChange={(e) => setCause(e.target.value as IncidentCause)}
              required
            >
              {INCIDENT_CAUSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label htmlFor="description" className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Descripción Técnica</label>
            <textarea
              id="description"
              rows={4}
              className="w-full border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué ha sucedido..."
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="observation" className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Nota de Seguimiento Inicial</label>
            <textarea
              id="observation"
              rows={4}
              className="w-full border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Primera nota de seguimiento para el histórico..."
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-gray-900 text-white px-12 py-4 rounded-2xl font-black shadow-2xl hover:bg-black active:scale-95 transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-50"
            disabled={!selectedKitchen || !authorData}
          >
            Guardar Gestión
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncidentRegistrationForm;
