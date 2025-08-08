// src/components/auth/SignUpForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, User, Mail, Lock, Phone } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import logger from '@/lib/logger';

// Schema de validação para o formulário
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
  const router = useRouter();
  
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
        // Redirecionar para uma página de "verifique seu email" após um tempo
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setError('Ocorreu um erro ao processar seu cadastro. Tente novamente.');
      logger.error('SignUpForm signup failed', { hasError: !!err });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg bg-[#13131f] border border-gray-800">
      {/* Barra de gradiente no topo */}
      <div className="h-2 bg-[#00e980]" />
      
      <CardHeader className="space-y-1 pt-6">
        <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
          <User className="h-6 w-6 text-[#00e980]" />
          Criar Conta
        </CardTitle>
        <CardDescription className="text-gray-300">Crie uma nova conta para começar a usar o Nexus Agents.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
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
                        className="pl-10 bg-[#13131f] border-gray-700 focus-visible:ring-[#00e980] text-white"
                      />
                    </FormControl>
                    <User className="absolute left-3 top-2.5 h-6 w-6 text-[#00e980]" />
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
                        className="pl-10 bg-[#13131f] border-gray-700 focus-visible:ring-[#00e980] text-white"
                      />
                    </FormControl>
                    <Mail className="absolute left-3 top-2.5 h-6 w-6 text-[#00e980]" />
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
                        className="pl-10 bg-[#13131f] border-gray-700 focus-visible:ring-[#00e980] text-white"
                      />
                    </FormControl>
                    <Phone className="absolute left-3 top-2.5 h-6 w-6 text-[#00e980]" />
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
                        className="pl-10 pr-10 bg-[#13131f] border-gray-700 focus-visible:ring-[#00e980] text-white"
                      />
                    </FormControl>
                    <Lock className="absolute left-3 top-2.5 h-6 w-6 text-[#00e980]" />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-indigo-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-6 w-6" />
                      ) : (
                        <Eye className="h-6 w-6" />
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
            
            <div className="flex justify-end gap-3 pt-2">
              <Link href="/login">
                <Button 
                  type="button" 
                  variant="outline"
                  className="border-gray-700 hover:border-[#00e980] text-gray-900 bg-white hover:bg-gray-100"
                >
                  Cancelar
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="px-6 bg-[#00e980] hover:bg-[#00c870] text-gray-900 font-medium transition-all shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px]"
                disabled={isLoading}
              >
                {isLoading ? 'Processando...' : 'Criar Conta'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-gray-800 p-4">
        <p className="text-sm text-gray-300">
          Já possui uma conta?{" "}
          <Link href="/login" className="text-[#00e980] hover:text-[#00c870] font-medium">
            Entrar
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
