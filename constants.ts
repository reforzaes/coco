
import { IncidentCause, TaskStatus } from './types';

export const SELLERS = ['Lara', 'Maybeth', 'Raquel'];
export const INSTALLERS = ['Instalador A', 'Instalador B', 'Instalador C', 'Instalador D'];
export const INCIDENT_CAUSES = Object.values(IncidentCause);
export const TASK_STATUSES = Object.values(TaskStatus);

export const USER_LDAP_MAP: Record<string, { name: string, role: string }> = {
  '30000001': { name: 'Lara', role: 'Vendedor' },
  '30000002': { name: 'Maybeth', role: 'Vendedor' },
  '30000003': { name: 'Raquel', role: 'Vendedor' },
  '30104750': { name: 'Javi', role: 'Manager' },
  '30000004': { name: 'Juanan', role: 'CPC' }
};
