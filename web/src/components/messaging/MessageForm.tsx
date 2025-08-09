'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Send, 
  Users, 
  User, 
  Calendar, 
  Clock, 
  FileText,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { 
  MessageType, 
  MessageScope, 
  MessagePriority, 
  CreateMessageDTO,
  MessageTemplate,
  MESSAGE_TYPES,
  MESSAGE_PRIORITIES,
  MESSAGE_SCOPES
} from '@/types/message';
import { createMessage } from '@/lib/actions/message.actions';

// Schema de validação
const messageSchema = z.object({
  type: z.enum(['notification', 'message', 'announcement', 'alert']),
  scope: z.enum(['individual', 'broadcast', 'role_based']),
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  scheduled_for: z.string().optional(),
  expires_at: z.string().optional(),
  recipient_ids: z.array(z.string()).optional(),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  templates?: MessageTemplate[];
  availableUsers?: Array<{ id: string; email: string; full_name?: string }>;
  initialData?: Partial<MessageFormData>;
  className?: string;
}

export function MessageForm({ 
  onSuccess, 
  onCancel, 
  templates = [], 
  availableUsers = [],
  initialData,
  className 
}: MessageFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      type: 'notification' as const,
      scope: 'broadcast' as const,
      priority: 'normal' as const,
      title: '',
      content: '',
      ...initialData
    },
  });

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form;
  const watchedScope = watch('scope');
  const watchedType = watch('type');

  // Aplicar template
  const applyTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    form.setValue('type', template.default_type);
    form.setValue('priority', template.default_priority);
    form.setValue('title', template.title_template);
    form.setValue('content', template.content_template);
  };

  // Limpar template
  const clearTemplate = () => {
    setSelectedTemplate(null);
    form.reset();
  };

  // Submeter formulário
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      const messageData: CreateMessageDTO = {
        type: data.type,
        scope: data.scope,
        title: data.title,
        content: data.content,
        priority: data.priority,
        scheduled_for: data.scheduled_for || undefined,
        expires_at: data.expires_at || undefined,
        recipient_ids: data.scope === 'individual' ? selectedUsers : undefined,
      };

      const result = await createMessage(messageData);

      if (result.error) {
        throw new Error(result.error);
      }

      form.reset();
      setSelectedUsers([]);
      setSelectedTemplate(null);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Aqui você pode adicionar um toast de erro
    } finally {
      setLoading(false);
    }
  };

  // Adicionar usuário selecionado
  const addSelectedUser = (userId: string) => {
    if (!selectedUsers.includes(userId)) {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Remover usuário selecionado
  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(id => id !== userId));
  };

  // Obter usuário por ID
  const getUserById = (userId: string) => {
    return availableUsers.find(user => user.id === userId);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Nova Mensagem
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Templates */}
        {templates.length > 0 && (
          <div className="space-y-3">
            <Label>Templates Disponíveis</Label>
            <div className="flex flex-wrap gap-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyTemplate(template)}
                  className="text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {template.name}
                </Button>
              ))}
              {selectedTemplate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearTemplate}
                  className="text-xs text-muted-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo e Escopo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Mensagem</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(MESSAGE_TYPES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                config.color === 'blue' && "bg-blue-500",
                                config.color === 'green' && "bg-green-500",
                                config.color === 'purple' && "bg-purple-500",
                                config.color === 'red' && "bg-red-500"
                              )} />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escopo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o escopo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(MESSAGE_SCOPES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              {key === 'individual' ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                              <div>
                                <div>{config.label}</div>
                                <div className="text-xs text-muted-foreground">{config.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Destinatários (apenas para escopo individual) */}
            {watchedScope === 'individual' && (
              <div className="space-y-3">
                <Label>Destinatários</Label>
                <Select onValueChange={addSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione os usuários" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers
                      .filter(user => !selectedUsers.includes(user.id))
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div>
                            <div className="font-medium">{user.full_name || user.email}</div>
                            {user.full_name && (
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((userId) => {
                      const user = getUserById(userId);
                      return user ? (
                        <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                          {user.full_name || user.email}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeSelectedUser(userId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título da mensagem" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conteúdo */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Digite o conteúdo da mensagem"
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/5000 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Prioridade */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(MESSAGE_PRIORITIES).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              config.color === 'red' && "bg-red-500",
                              config.color === 'orange' && "bg-orange-500",
                              config.color === 'blue' && "bg-blue-500",
                              config.color === 'gray' && "bg-gray-500"
                            )} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Agendamento (opcional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduled_for"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agendar Para (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Deixe em branco para enviar imediatamente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expira Em (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Data de expiração da mensagem
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              )}
              
              <Button 
                type="submit" 
                disabled={loading || (watchedScope === 'individual' && selectedUsers.length === 0)}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
