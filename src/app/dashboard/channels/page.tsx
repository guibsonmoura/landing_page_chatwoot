import { getChannels } from '@/lib/actions/channel.actions';
import ChannelClientPage from './client-page';

// Esta é uma página de servidor (Server Component)
export default async function ChannelsPage() {
  // 1. Busca os dados no servidor
  const { data: channels, error } = await getChannels();

  // 2. Lida com o estado de erro no servidor
  if (error) {
    return <div className="p-4 text-red-500">Erro ao carregar canais: {error}</div>;
  }

  // 3. Passa os dados para o componente de cliente, que cuidará da interatividade
  return <ChannelClientPage initialChannels={channels || []} />;
}

