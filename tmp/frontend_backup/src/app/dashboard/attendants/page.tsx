import { getAttendants } from '@/lib/actions/attendant.actions';
import AttendantClientPage from './client-page';

// Esta é uma página de servidor (Server Component)
export default async function AttendantsPage() {
  // 1. Busca os dados no servidor
  const { data: attendants, error } = await getAttendants();

  // 2. Lida com o estado de erro no servidor
  if (error) {
    return <div className="p-4 text-red-500">Erro ao carregar atendentes: {error}</div>;
  }

  // 3. Passa os dados para o componente de cliente, que cuidará da interatividade
  return <AttendantClientPage initialAttendants={attendants || []} />;
}
