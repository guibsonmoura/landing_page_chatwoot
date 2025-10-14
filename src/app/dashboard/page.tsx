import { redirect } from 'next/navigation';

// Redireciona para a página "Meu Plano" como tela inicial
// Isso melhora a experiência do usuário evitando o carregamento lento do Analytics
export default function DashboardPage() {
  redirect('/dashboard/plano');
}
