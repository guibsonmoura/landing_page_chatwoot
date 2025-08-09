// src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, Mail, Bot, BrainCircuit, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function LoginForm() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md overflow-hidden border-0 shadow-lg bg-[#13131f] border border-gray-800">
      {/* Barra de gradiente no topo */}
      <div className="h-2 bg-[#00e980]" />
      
      <div className="flex justify-center mt-8 mb-2">
        <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-lg">
          <img 
            src="/images/logos/logo_128x128.png" 
            alt="Nexus Agents Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      <CardHeader className="space-y-1 text-center pb-2">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">Nexus Agents</CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">
          Entre com suas credenciais para acessar sua conta
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4 pb-6 px-8">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-white">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-[#00e980]" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-10 bg-[#13131f] border-gray-700 focus-visible:ring-[#00e980] text-white selection:bg-[#00e980] selection:text-black"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium text-white">
                Senha
              </Label>
              <Link 
                href="#" 
                className="text-xs text-[#00e980] hover:text-[#00c870]"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-[#00e980]" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pl-10 bg-[#13131f] border-gray-700 focus-visible:ring-[#00e980] text-white selection:bg-[#00e980] selection:text-black"
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1.5 h-8 w-8 text-gray-400 hover:text-[#00e980] transition-colors"
                onClick={toggleShowPassword}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full h-11 bg-[#00e980] hover:bg-[#00c870] text-gray-900 font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-0">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#13131f] px-2 text-white">
              Ou continue com
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="bg-[#13131f] border-gray-700 hover:border-[#00e980] text-white">
            <Sparkles className="mr-2 h-4 w-4 text-[#00e980]" />
            Google
          </Button>
          <Button variant="outline" className="bg-[#13131f] border-gray-700 hover:border-[#00e980] text-white">
            <Bot className="mr-2 h-4 w-4 text-[#00e980]" />
            Microsoft
          </Button>
        </div>
        
        <p className="text-center text-sm text-gray-400 mt-4">
          Não tem uma conta?{" "}
          <Link 
            href="/signup" 
            className="text-[#00e980] hover:text-[#00c870] font-medium"
          >
            Cadastre-se
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
