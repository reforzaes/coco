import React from 'react';
import { Kitchen, Incident, TaskStatus } from '../types';

interface KitchenDetailModalProps {
  kitchen: Kitchen | null;
  incidents: Incident[];
  onClose: () => void;
}

const KitchenDetailModal: React.FC<KitchenDetailModalProps> = ({ kitchen, incidents, onClose }) => {
  if (!kitchen) return null;

  const kitchenIncidents = incidents.filter(i => i.kitchenId === kitchen.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Latest first

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Detalles de la Cocina: {kitchen.orderNumber}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6">
            <div>
              <p><strong>Cliente:</strong> {kitchen.clientName}</p>
              <p><strong>Vendedor:</strong> {kitchen.seller}</p>
              <p><strong>Instalador:</strong> {kitchen.installer}</p>
            </div>
            <div>
              <p><strong>LDAP:</strong> {kitchen.ldap}</p>
              <p><strong>Fecha Instalación:</strong> {kitchen.installationDate}</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-t pt-4">Histórico de Acciones / Incidencias</h3>
          {kitchenIncidents.length === 0 ? (
            <p className="text-gray-600">No hay incidencias registradas para esta cocina.</p>
          ) : (
            <div className="space-y-4">
              {kitchenIncidents.map((incident) => (
                <div key={incident.id} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <p className="text-sm text-gray-800"><strong>Descripción:</strong> {incident.description}</p>
                  <p className="text-sm text-gray-800"><strong>Observación:</strong> {incident.observation || 'N/A'}</p>
                  <p className="text-sm text-gray-800"><strong>Causa:</strong> {incident.cause}</p>
                  {incident.assignedToSeller && <p className="text-sm text-gray-800"><strong>Asignado a Vendedor:</strong> {incident.assignedToSeller}</p>}
                  {incident.assignedToInstaller && <p className="text-sm text-gray-800"><strong>Asignado a Instalador:</strong> {incident.assignedToInstaller}</p>}
                  <p className={`text-sm font-medium ${incident.status === TaskStatus.COMPLETED ? 'text-green-600' : incident.status === TaskStatus.IN_PROGRESS ? 'text-blue-600' : 'text-yellow-600'}`}>
                    <strong>Estado:</strong> {incident.status}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Registrado el: {new Date(incident.createdAt).toLocaleDateString()} {new Date(incident.createdAt).toLocaleTimeString()}</p>
                  {incident.updatedAt !== incident.createdAt && (
                     <p className="text-xs text-gray-500">Última actualización: {new Date(incident.updatedAt).toLocaleDateString()} {new Date(incident.updatedAt).toLocaleTimeString()}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KitchenDetailModal;