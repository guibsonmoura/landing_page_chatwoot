'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {Loading} from '@/components/layout/loading';

import { Eye, EyeOff, User, Mail, Lock, Phone } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import logger from '@/lib/logger';


const Lottie = dynamic(() => import('lottie-react'), { ssr: false });


const signUpSchema = z.object({
  displayName: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z
    .string()
    .min(10, { message: 'Telefone deve ter pelo menos 10 dígitos' })
    .regex(/^\+?[0-9\s\-\(\)]+$/, { message: 'Formato de telefone inválido' }),
  password: z
    .string()
    .min(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
    .regex(/[A-Z]/, { message: 'Senha deve conter pelo menos uma letra maiúscula' })
    .regex(/[a-z]/, { message: 'Senha deve conter pelo menos uma letra minúscula' })
    .regex(/[0-9]/, { message: 'Senha deve conter pelo menos um número' }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAnimation, setLoadingAnimation] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const router = useRouter();
  

  useEffect(() => {
    fetch('/lottie/Sandy Loading.json')
      .then(res => res.json())
      .then(data => setLoadingAnimation(data))
      .catch(err => console.error('Erro ao carregar animação:', err));
  }, []);

  const handleSignInClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage('Carregando...');
    setTimeout(() => {
      router.push('/login');
    }, 500);
  };
  
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const handleSignUp = async (values: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Cadastro no Supabase com os campos adicionais
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            display_name: values.displayName,
            phone: values.phone,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
        
        
        router.push('/login');
        
      }
    } catch (err) {
      setError('Ocorreu um erro ao processar seu cadastro. Tente novamente.');
      logger.error('SignUpForm signup failed', { hasError: !!err });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Overlay com Loading Lottie */}
      {isLoading && loadingAnimation && (
        <Loading loadingAnimation={loadingAnimation} Lottie={Lottie}/>
      )}

      <Card className="w-full max-w-md shadow-lg bg-[#13131f] border border-gray-800 mt-8">
        
        <div className="h-2 bg-[#00e980]" />
        
        <CardHeader >
          <div className="flex justify-center">
            <div className="relative h-16 w-16 rounded-xl overflow-hidden shadow-lg">
              <img 
                src="/images/logos/logo_128x128.png" 
                alt="365IA Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          <div className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-gray-300 mt-1">
              Comece a usar o 365IA criando sua conta
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-2">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nome Completo</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="Seu nome completo"
                          {...field}
                          disabled={isLoading}
                          className="h-12 pl-10 bg-[#13131f] border-gray-700 focus-visible:ring-[#00e980] text-white selection:bg-[#00e980] selection:text-black"
                        />
                      </FormControl>
                      <User className="absolute left-3 top-3 h-5 w-5 text-[#00e980]" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="seu@email.com"
                          type="email"
                          {...field}
                          disabled={isLoading}
                          className="h-12 pl-10 bg-[#13131f] border-gray-700 focus-visible:ring-[#00e980] text-white selection:bg-[#00e980] selection:text-black"
                        />
                      </FormControl>
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-[#00e980]" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Telefone</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="+55 (11) 98765-4321"
                          {...field}
                          disabled={isLoading}
                          className="h-12 pl-10 bg-[#13131f] border-gray-700 focus-visible:ring-[#00e980] text-white selection:bg-[#00e980] selection:text-black"
                        />
                      </FormControl>
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-[#00e980]" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Senha</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="********"
                          type={showPassword ? "text" : "password"}
                          {...field}
                          disabled={isLoading}
                          className="h-12 pl-10 pr-10 bg-[#13131f] border-gray-700 focus-visible:ring-[#00e980] text-white selection:bg-[#00e980] selection:text-black"
                        />
                      </FormControl>
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-[#00e980]" />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="absolute right-3 top-3 text-slate-400 hover:text-[#00e980] transition-colors disabled:opacity-50"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {error && (
                <div className="p-3 rounded-md bg-red-900/20 border border-red-800 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              {message && (
                <div className="p-3 rounded-md bg-green-900/20 border border-green-800 text-green-400 text-sm">
                  {message}
                </div>
              )}
              
              <div className="flex justify-center pt-2">
                <Button 
                  type="submit" 
                  className="px-6 w-full bg-[#00e980] hover:bg-[#00c870] text-gray-900 font-medium transition-all shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processando...' : 'Criar Conta'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-gray-800">
          <p className="text-sm text-gray-300">
            Já possui uma conta?{" "}
            <Link 
              href="/login" 
              onClick={handleSignInClick}
              className="text-[#00e980] hover:text-[#00c870] font-medium">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  );
}