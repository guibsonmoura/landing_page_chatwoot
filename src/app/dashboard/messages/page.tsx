import { Suspense } from 'react';
import { Metadata } from 'next';
import { MessagesClientPage } from './client-page';

export const metadata: Metadata = {
  title: 'Mensagens | Nexus Agents',
  description: 'Sistema de mensagens e notificações internas',
};

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <MessagesClientPage />
    </Suspense>
  );
}
