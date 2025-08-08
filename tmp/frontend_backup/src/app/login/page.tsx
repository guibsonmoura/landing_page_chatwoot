// src/app/login/page.tsx
import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Login | Nexus Agents',
  description: 'Acesse sua conta na plataforma Nexus Agents',
};

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0d0d17]">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4 relative overflow-hidden">
        {/* Efeito de gradiente circular sutil */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[300px] -left-[300px] w-[600px] h-[600px] rounded-full bg-[#00e980] opacity-[0.03] blur-[150px]"></div>
          <div className="absolute -bottom-[200px] -right-[200px] w-[500px] h-[500px] rounded-full bg-[#4d7cfe] opacity-[0.03] blur-[150px]"></div>
          <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full bg-[#e34ba9] opacity-[0.02] blur-[100px]"></div>
        </div>
        
        {/* Conteúdo */}
        <div className="relative z-10 w-full max-w-md">
          <LoginForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
