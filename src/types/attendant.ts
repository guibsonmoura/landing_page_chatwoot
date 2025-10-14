export interface Attendant {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  password_temp: string;
  profile: 'atendente' | 'administrador';
  created_at: string;
}
