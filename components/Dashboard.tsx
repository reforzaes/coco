
import React, { useMemo } from 'react';
import { Kitchen, SummaryData, Incident, IncidentCause, TaskStatus } from '../types';
import IncidentCausePieChart from './IncidentCausePieChart';
import ResolutionSpeedAnalysis from './ResolutionSpeedAnalysis';

interface DashboardProps {
  kitchens: Kitchen[];
  sellerSummary: SummaryData[];
  installerSummary: SummaryData[];
  incidents: Incident[];
  onAddKitchen: (kitchen: Omit<Kitchen, 'id'>) => void;
  onOpenDrilldown: (type: 'seller' | 'installer', label: string) => void;
  onNavigateToTasks: () => void;
}

const SummaryCard: React.FC<{ 
  title: string; 
  value: string | number; 
  description: string; 
  colorClass: string;
  onClick?: () => void;
}> = ({ title, value, description, colorClass, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-8 rounded-[2.5rem] shadow-sm border flex flex-col relative overflow-hidden group transition-all hover:shadow-xl ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
  >
    <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-10 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform`}></div>
    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{title}</h3>
    <p className="text-5xl font-black text-gray-900 tracking-tighter mb-1 leading-none">{value}</p>
    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{description}</p>
    {onClick && (
      <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Ir a Tareas →</span>
      </div>
    )}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({
  kitchens,
  sellerSummary,
  installerSummary,
  incidents,
  onOpenDrilldown,
  onNavigateToTasks
}) => {
  const totalKitchens = kitchens.length;
  
  const kitchenIdsWithHistoricalIncidents = new Set(incidents.map(i => i.kitchenId));
  const historicalAffectedCount = kitchens.filter(k => kitchenIdsWithHistoricalIncidents.has(k.id)).length;
  const historicalRatio = totalKitchens > 0 ? ((historicalAffectedCount / totalKitchens) * 100).toFixed(1) : '0';

  const kitchenIdsWithActiveIncidents = new Set(
    incidents.filter(i => i.status !== TaskStatus.COMPLETED).map(i => i.kitchenId)
  );
  const activeAffectedCount = kitchens.filter(k => kitchenIdsWithActiveIncidents.has(k.id)).length;
  const pendingRatio = totalKitchens > 0 ? ((activeAffectedCount / totalKitchens) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Cards de resumen superior */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Instalaciones"
          value={totalKitchens}
          description="Proyectos Registrados"
          colorClass="bg-emerald-500"
        />
        <SummaryCard
          title="Errores Totales"
          value={historicalAffectedCount}
          description="Cocinas con Historial"
          colorClass="bg-red-500"
        />
        <SummaryCard
          title="Ratio Calidad Total"
          value={`${historicalRatio}%`}
          description="% Histórico Acumulado"
          colorClass="bg-amber-500"
        />
        <SummaryCard
          title="Ratio Pendientes"
          value={`${pendingRatio}%`}
          description="% Gestiones Activas"
          colorClass="bg-blue-500"
          onClick={onNavigateToTasks}
        />
      </div>

      {/* Secciones de Análisis de Velocidad y Origen (ARRIBA) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ResolutionSpeedAnalysis incidents={incidents} />
        <IncidentCausePieChart incidents={incidents.filter(i => i.cause !== IncidentCause.OTHER)} />
      </div>

      {/* Secciones de Tablas de Profesionales (ABAJO) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-6 md:p-10 rounded-[3.5rem] shadow-sm border overflow-hidden">
          <h2 className="text-xl font-black mb-8 text-gray-800 uppercase tracking-tighter flex items-center gap-4">
            <span className="w-4 h-4 bg-emerald-500 rounded-full"></span>
            Resumen Vendedores (Histórico)
          </h2>
          <div className="overflow-x-auto rounded-[2.5rem] border border-gray-50">
            <table className="min-w-[500px] md:min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
                <tr>
                  <th className="px-6 py-5 text-left">Vendedor</th>
                  <th className="px-6 py-5 text-center">Total</th>
                  <th className="px-6 py-5 text-center">Incidencias</th>
                  <th className="px-6 py-5 text-right">% Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sellerSummary.map((data) => (
                  <tr 
                    key={data.label} 
                    className="hover:bg-emerald-50 cursor-pointer transition-all active:scale-[0.98] group"
                    onClick={() => onOpenDrilldown('seller', data.label)}
                  >
                    <td className="px-6 py-5 font-bold text-gray-700 group-hover:text-emerald-700 whitespace-nowrap">{data.label}</td>
                    <td className="px-6 py-5 text-center text-emerald-600 font-black">{data.totalKitchens}</td>
                    <td className="px-6 py-5 text-center text-red-600 font-black">{data.incidents}</td>
                    <td className="px-6 py-5 text-right text-gray-400 font-bold whitespace-nowrap">{data.incidencePercentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[3.5rem] shadow-sm border overflow-hidden">
          <h2 className="text-xl font-black mb-8 text-gray-800 uppercase tracking-tighter flex items-center gap-4">
            <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
            Resumen Instaladores (Histórico)
          </h2>
          <div className="overflow-x-auto rounded-[2.5rem] border border-gray-50">
            <table className="min-w-[500px] md:min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
                <tr>
                  <th className="px-6 py-5 text-left">Instalador</th>
                  <th className="px-6 py-5 text-center">Total</th>
                  <th className="px-6 py-5 text-center">Incidencias</th>
                  <th className="px-6 py-5 text-right">% Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {installerSummary.map((data) => (
                  <tr 
                    key={data.label} 
                    className="hover:bg-blue-50 cursor-pointer transition-all active:scale-[0.98] group"
                    onClick={() => onOpenDrilldown('installer', data.label)}
                  >
                    <td className="px-6 py-5 font-bold text-gray-700 group-hover:text-blue-700 whitespace-nowrap">{data.label}</td>
                    <td className="px-6 py-5 text-center text-blue-600 font-black">{data.totalKitchens}</td>
                    <td className="px-6 py-5 text-center text-red-600 font-black">{data.incidents}</td>
                    <td className="px-6 py-5 text-right text-gray-400 font-bold whitespace-nowrap">{data.incidencePercentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
