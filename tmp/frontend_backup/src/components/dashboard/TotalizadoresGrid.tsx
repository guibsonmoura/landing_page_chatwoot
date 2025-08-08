'use client';

import { TotalizadorCard } from './TotalizadorCard';
import { Users, MessageCircle, Send, Inbox } from 'lucide-react';
import { TotalizadorData } from '@/lib/actions/analytics.actions';

interface TotalizadoresGridProps {
  clientes: TotalizadorData;
  atendimentos: TotalizadorData;
  mensagensEnviadas: TotalizadorData;
  mensagensRecebidas: TotalizadorData;
  loading?: boolean;
}

export function TotalizadoresGrid({
  clientes,
  atendimentos,
  mensagensEnviadas,
  mensagensRecebidas,
  loading = false
}: TotalizadoresGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <TotalizadorCard
        title="Clientes"
        value={clientes.total}
        icon={Users}
        color="blue"
        loading={loading}
        error={clientes.error}
      />
      
      <TotalizadorCard
        title="Atendimentos"
        value={atendimentos.total}
        icon={MessageCircle}
        color="green"
        loading={loading}
        error={atendimentos.error}
      />
      
      <TotalizadorCard
        title="Mensagens Recebidas"
        value={mensagensRecebidas.total}
        icon={Inbox}
        color="purple"
        loading={loading}
        error={mensagensRecebidas.error}
      />
      
      <TotalizadorCard
        title="Mensagens Enviadas"
        value={mensagensEnviadas.total}
        icon={Send}
        color="orange"
        loading={loading}
        error={mensagensEnviadas.error}
      />
    </div>
  );
}
