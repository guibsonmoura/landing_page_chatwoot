'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, User, Sparkles, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Attendant } from '@/types/attendant';
import { createAttendant, updateAttendant, getAttendants } from '@/lib/actions/attendant.actions';
import { usePlanStore } from '@/stores/planStore';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Schema de validação para o formulário
const attendantFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password_temp: z.string().min(6, 'A senha temporária deve ter pelo menos 6 caracteres'),
  profile: z.enum(['atendente', 'administrador']).refine(val => val === 'atendente' || val === 'administrador', {
    message: 'O perfil deve ser "atendente" ou "administrador"'
  }),
});

type AttendantFormValues = z.infer<typeof attendantFormSchema>;

interface CreateAttendantModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAttendantCreated?: (attendant: Attendant) => void;
  onAttendantUpdated?: (attendant: Attendant) => void;
  attendant?: Attendant;
}

export function CreateAttendantModal({
  isOpen,
  onOpenChange,
  onAttendantCreated,
  onAttendantUpdated,
  attendant,
}: CreateAttendantModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendantCount, setAttendantCount] = useState<number>(0);
  const [isLimitReached, setIsLimitReached] = useState<boolean>(false);
  
  const planFeatures = usePlanStore((state: any) => state.planFeatures);
  const maxAttendants = planFeatures?.max_attendants || 0;
  const isEditing = !!attendant;

  // Inicializa o formulário com os valores do atendente se estiver editando
  const form = useForm<AttendantFormValues>({
    resolver: zodResolver(attendantFormSchema),
    defaultValues: {
      name: attendant?.name || '',
      email: attendant?.email || '',
      password_temp: attendant?.password_temp || '',
      profile: attendant?.profile as 'atendente' | 'administrador' || 'atendente',
    },
  });
  
  useEffect(() => {
    if (isOpen) {
      // Busca atendentes para verificar o limite
      const fetchAttendants = async () => {
        const result = await getAttendants();
        if (result.data) {
          const currentCount = result.data.length;
          setAttendantCount(currentCount);
          setIsLimitReached(currentCount >= maxAttendants);
        }
      };
      fetchAttendants();
      
      // Reset do formulário
      if (isEditing && attendant) {
        form.reset({
          name: attendant.name,
          email: attendant.email,
          password_temp: attendant.password_temp || '',
          profile: attendant.profile as 'atendente' | 'administrador',
        });
      } else {
        form.reset({
          name: '',
          email: '',
          password_temp: '',
          profile: 'atendente',
        });
      }
    }
  }, [isOpen, attendant, isEditing, form, maxAttendants]);

  const onSubmit = async (values: AttendantFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing && attendant) {
        // Atualiza um atendente existente
        const formData = new FormData();
        formData.append('id', attendant.id);
        formData.append('name', values.name);
        formData.append('email', values.email);
        formData.append('password_temp', values.password_temp);
        formData.append('profile', values.profile);
        
        const result = await updateAttendant(formData);

        if (result.error) {
          toast.error('Erro ao atualizar atendente', { description: result.error });
        } else {
          toast.success('Atendente atualizado com sucesso!');
          if (onAttendantUpdated && result.data) {
            onAttendantUpdated(result.data);
          }
          router.refresh();
          onOpenChange(false);
        }
      } else {
        // Cria um novo atendente
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('email', values.email);
        formData.append('password_temp', values.password_temp);
        formData.append('profile', values.profile);
        
        const result = await createAttendant(formData);

        if (result.error) {
          toast.error('Erro ao criar atendente', { description: result.error });
        } else {
          toast.success('Atendente criado com sucesso!');
          if (onAttendantCreated && result.data) {
            onAttendantCreated(result.data);
          }
          router.refresh();
          onOpenChange(false);
        }
      }
    } catch (error: any) {
      toast.error('Erro ao processar atendente', { 
        description: error?.message || 'Ocorreu um erro inesperado' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[950px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-0 shadow-xl max-h-[85vh] flex flex-col">
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar with illustration */}
          <div className="hidden md:flex md:w-1/4 bg-gradient-to-br from-blue-500 to-purple-600 p-6 flex-col justify-between text-white">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{isEditing ? 'Editar Atendente' : 'Novo Atendente'}</h3>
              <p className="text-sm text-white/80">
                {isEditing 
                  ? 'Atualize as informações do atendente para gerenciar seu acesso.' 
                  : 'Configure um novo atendente para gerenciar o atendimento aos seus clientes.'}
              </p>
            </div>
            <div className="mt-auto">
              <div className="flex items-center space-x-2 text-sm">
                <Sparkles className="h-4 w-4 text-white/70" />
                <span className="text-white/70">Powered by Nexus Agents</span>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <div className="flex flex-col md:w-3/4 h-full">
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  {isEditing ? 'Editar Atendente' : 'Criar Novo Atendente'}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? 'Atualize as informações do atendente abaixo.'
                    : 'Preencha as informações para criar um novo atendente.'}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {!isEditing && isLimitReached && (
                  <div className="mb-4 p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
                    <div className="flex items-start">
                      <div className="mr-3 mt-0.5">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h5 className="font-medium text-red-800 dark:text-red-300">Limite de atendentes atingido</h5>
                        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                          Você já atingiu o limite de {maxAttendants} atendentes do seu plano.
                          Para criar mais atendentes, faça um upgrade do seu plano.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome completo do atendente"
                          className="w-full border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-slate-500">
                        Nome completo do atendente para identificação.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          className="w-full border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-slate-500">
                        Email que será usado para login do atendente.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password_temp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha Temporária</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Senha temporária"
                          className="w-full border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-slate-500">
                        Senha inicial que o atendente usará no primeiro acesso.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />



                <FormField
                  control={form.control}
                  name="profile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500">
                            <SelectValue placeholder="Selecione o perfil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="atendente">Atendente</SelectItem>
                          <SelectItem value="administrador">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs text-slate-500">
                        Nível de acesso que o atendente terá no sistema.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-6">
                  <DialogFooter className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={isSubmitting}
                      className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || (!isEditing && isLimitReached)}
                      className={cn(
                        "bg-indigo-600 hover:bg-indigo-700 text-white px-6",
                        (!isEditing && isLimitReached) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditing ? 'Salvando...' : 'Criando...'}
                        </>
                      ) : (
                        isEditing ? 'Salvar' : 'Criar'
                      )}
                    </Button>
                  </DialogFooter>
                </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
