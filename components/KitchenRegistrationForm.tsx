
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Kitchen } from '../types';
import { SELLERS, INSTALLERS, USER_LDAP_MAP } from '../constants';

interface KitchenRegistrationFormProps {
  onAddKitchen: (kitchen: Omit<Kitchen, 'id'>) => void;
}

const KitchenRegistrationForm: React.FC<KitchenRegistrationFormProps> = ({ onAddKitchen }) => {
  const [authorLdap, setAuthorLdap] = useState<string>('');
  const [ldapSearch, setLdapSearch] = useState<string>('');
  const [showLdapResults, setShowLdapResults] = useState<boolean>(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [seller, setSeller] = useState<string>(SELLERS[0]);
  const [installer, setInstaller] = useState<string>(INSTALLERS[0]);
  const [installationDate, setInstallationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ldapWrapperRef.current && !ldapWrapperRef.current.contains(event.target as Node)) {
        setShowLdapResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Si el usuario es un vendedor, forzamos su nombre en el campo seller y bloqueamos edición
  useEffect(() => {
    if (authorData && authorData.role === 'Vendedor') {
      setSeller(authorData.name);
    }
  }, [authorData]);

  const handleSelectLdap = (ldap: string) => {
    setAuthorLdap(ldap);
    setLdapSearch(ldap);
    setShowLdapResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authorLdap || !authorData) {
      alert('Introduzca un LDAP válido para continuar.');
      return;
    }

    if (!orderNumber || !clientName || !seller || !installer || !installationDate) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    onAddKitchen({
      ldap: authorLdap,
      orderNumber,
      clientName,
      seller,
      installer,
      installationDate,
    });

    setOrderNumber('');
    setClientName('');
    alert('Proyecto registrado con éxito.');
  };

  const isSellerUser = authorData?.role === 'Vendedor';

  return (
    <div className="bg-white p-4 md:p-8 h-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Sección de Identificación por LDAP con Buscador por Nombre */}
        <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100 mb-6 transition-all relative" ref={ldapWrapperRef}>
          <label htmlFor="ldapSearch" className="block text-[10px] font-black text-emerald-700 uppercase mb-2 tracking-widest">Tu Identificación (Nombre o LDAP)</label>
          <div className="relative">
            <input
              type="text"
              id="ldapSearch"
              autoComplete="off"
              className={`w-full border-2 rounded-2xl p-4 font-bold text-gray-700 outline-none transition-all ${authorData ? 'border-emerald-500 bg-white' : 'border-gray-200 bg-white focus:border-emerald-300'}`}
              value={ldapSearch}
              onChange={(e) => {
                setLdapSearch(e.target.value);
                setShowLdapResults(true);
                if (USER_LDAP_MAP[e.target.value]) setAuthorLdap(e.target.value);
                else if (authorLdap) setAuthorLdap('');
              }}
              onFocus={() => setShowLdapResults(true)}
              placeholder="Escribe tu nombre o LDAP..."
              required
            />
            {authorData && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none animate-in fade-in slide-in-from-right-2">
                <span className="text-[10px] font-black text-emerald-600 uppercase leading-none">{authorData.name}</span>
                <span className="text-[7px] text-emerald-400 font-bold uppercase">{authorData.role}</span>
              </div>
            )}
          </div>

          {showLdapResults && ldapSearchResults.length > 0 && (
            <div className="absolute z-[110] left-5 right-5 top-full mt-2 bg-white border-2 border-emerald-500 rounded-2xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto animate-in slide-in-from-top-2">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="orderNumber" className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Número de Pedido</label>
            <input
              type="text"
              id="orderNumber"
              className="w-full border-2 border-gray-100 rounded-2xl p-3.5 font-bold text-gray-700 outline-none focus:border-emerald-500 transition-all bg-gray-50/30 focus:bg-white"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Ej: 80112233"
              required
            />
          </div>
          <div>
            <label htmlFor="installationDate" className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Fecha de Instalación</label>
            <input
              type="date"
              id="installationDate"
              className="w-full border-2 border-gray-100 rounded-2xl p-3.5 font-bold text-gray-700 outline-none focus:border-emerald-500 transition-all bg-gray-50/30 focus:bg-white"
              value={installationDate}
              onChange={(e) => setInstallationDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="clientName" className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Nombre del Cliente</label>
          <input
            type="text"
            id="clientName"
            className="w-full border-2 border-gray-100 rounded-2xl p-3.5 font-bold text-gray-700 uppercase outline-none focus:border-emerald-500 transition-all bg-gray-50/30 focus:bg-white"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Nombre completo del cliente"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="seller" className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Vendedor Responsable</label>
            <div className="relative">
              <select
                id="seller"
                className={`w-full border-2 rounded-2xl p-3.5 font-bold text-gray-700 outline-none appearance-none transition-all ${isSellerUser ? 'border-emerald-200 bg-emerald-50/50 cursor-not-allowed text-emerald-800' : 'border-gray-100 focus:border-emerald-500 bg-gray-50/30 focus:bg-white'}`}
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
                disabled={isSellerUser}
                required
              >
                {SELLERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {isSellerUser && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] opacity-40">
                  🔒
                </div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="installer" className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Instalador Asignado</label>
            <select
              id="installer"
              className="w-full border-2 border-gray-100 rounded-2xl p-3.5 font-bold text-gray-700 outline-none focus:border-emerald-500 transition-all appearance-none bg-gray-50/30 focus:bg-white"
              value={installer}
              onChange={(e) => setInstaller(e.target.value)}
              required
            >
              {INSTALLERS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:shadow-emerald-200 active:scale-95 transition-all disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none"
            disabled={!authorData}
          >
            Dar de Alta Proyecto
          </button>
          {!authorData && ldapSearch.length > 0 && (
            <p className="text-center text-[9px] font-bold text-red-500 uppercase mt-3 animate-pulse">Usuario No reconocido en el sistema</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default KitchenRegistrationForm;
