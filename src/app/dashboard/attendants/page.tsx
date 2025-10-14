import { getAttendants } from '@/lib/actions/attendant.actions';
import { createClient } from '@/lib/supabase/server';
import AttendantClientPage from './client-page';

// Esta é uma página de servidor (Server Component)
export default async function AttendantsPage() {
  // 1. Busca os dados no servidor
  const { data: attendants, error } = await getAttendants();

  // 2. Lida com o estado de erro no servidor
  if (error) {
    return <div className="p-4 text-red-500">Erro ao carregar atendentes: {error}</div>;
  }

  // 3. Buscar chat_url do tenant autenticado
  let chatUrl: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('chat_url')
        .eq('user_id', user.id)
        .single();
      chatUrl = tenant?.chat_url ?? null;
    }
  } catch (_) {
    // silencioso para não quebrar a página se não houver chat_url
  }

  // 4. Passa os dados e o chatUrl para o componente de cliente
  return <AttendantClientPage initialAttendants={attendants || []} chatUrl={chatUrl ?? undefined} />;
}
