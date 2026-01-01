
import React, { useState, useEffect, useMemo } from 'react';
import { Kitchen } from '../types';
import { SELLERS, INSTALLERS, USER_LDAP_MAP } from '../constants';

interface KitchenRegistrationFormProps {
  onAddKitchen: (kitchen: Omit<Kitchen, 'id'>) => void;
}

const KitchenRegistrationForm: React.FC<KitchenRegistrationFormProps> = ({ onAddKitchen }) => {
  const [authorLdap, setAuthorLdap] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [seller, setSeller] = useState<string>(SELLERS[0]);
  const [installer, setInstaller] = useState<string>(INSTALLERS[0]);
  const [installationDate, setInstallationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const authorData = useMemo(() => USER_LDAP_MAP[authorLdap] || null, [authorLdap]);

  // Si el usuario es un vendedor, forzamos su nombre en el campo seller y bloqueamos edición
  useEffect(() => {
    if (authorData && authorData.role === 'Vendedor') {
      setSeller(authorData.name);
    }
  }, [authorData]);

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

    // Resetear campos de pedido pero mantener LDAP y profesionales para agilidad
    setOrderNumber('');
    setClientName('');
    alert('Proyecto registrado con éxito.');
  };

  const isSellerUser = authorData?.role === 'Vendedor';

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border h-full">
      <h2 className="text-2xl font-black mb-6 text-gray-800 uppercase tracking-tighter">Registrar Nueva Cocina</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Sección de Identificación por LDAP */}
        <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100 mb-6 transition-all">
          <label htmlFor="authorLdap" className="block text-[10px] font-black text-emerald-700 uppercase mb-2 tracking-widest">Tu LDAP (Identificación)</label>
          <div className="relative">
            <input
              type="text"
              id="authorLdap"
              className={`w-full border-2 rounded-2xl p-4 font-bold text-gray-700 outline-none transition-all ${authorData ? 'border-emerald-500 bg-white' : 'border-gray-200 bg-white focus:border-emerald-300'}`}
              value={authorLdap}
              onChange={(e) => setAuthorLdap(e.target.value)}
              placeholder="Ej: 30104750"
              required
            />
            {authorData && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none animate-in fade-in slide-in-from-right-2">
                <span className="text-[10px] font-black text-emerald-600 uppercase leading-none">{authorData.name}</span>
                <span className="text-[7px] text-emerald-400 font-bold uppercase">{authorData.role}</span>
              </div>
            )}
          </div>
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
          {!authorData && authorLdap.length > 0 && (
            <p className="text-center text-[9px] font-bold text-red-500 uppercase mt-3 animate-pulse">LDAP No reconocido en el sistema</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default KitchenRegistrationForm;
