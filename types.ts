
export interface Kitchen {
  id: string;
  ldap: string;
  orderNumber: string;
  clientName: string;
  seller: string;
  installer: string;
  installationDate: string; // YYYY-MM-DD
}

export enum TaskStatus {
  PENDING = 'Pendiente',
  IN_PROGRESS = 'Gestionando',
  COMPLETED = 'Completada',
}

export enum IncidentCause {
  SELLER = 'Vendedor',
  INSTALLER = 'Instalador',
  LOGISTICS = 'Logística',
  OTHER = 'Otro',
}

export interface ObservationEntry {
  text: string;
  date: string;
  statusAtTime: TaskStatus;
  authorLdap: string;
  authorName: string;
}

export interface Incident {
  id: string;
  kitchenId: string;
  description: string;
  observation: string; // Mantenido por compatibilidad con BD
  history?: ObservationEntry[]; 
  status: TaskStatus;
  assignedToSeller: string | null;
  assignedToInstaller: string | null;
  cause: IncidentCause;
  createdAt: string; 
  updatedAt: string; 
}

export interface SummaryData {
  label: string;
  totalKitchens: number;
  incidents: number;
  incidencePercentage: number;
}
