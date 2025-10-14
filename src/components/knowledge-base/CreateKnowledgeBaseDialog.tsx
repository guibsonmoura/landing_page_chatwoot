'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Upload, Loader2, Link } from 'lucide-react';
import logger from '@/lib/logger';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateKnowledgeBaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  knowledgeBaseToEdit?: {
    id: number;
    file_name: string;
    agent_id: string | null;
  } | null;
}

export function CreateKnowledgeBaseDialog({ isOpen, onClose, onSuccess, knowledgeBaseToEdit }: CreateKnowledgeBaseDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agents, setAgents] = useState<{id: string, agent_name: string}[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  
  const isEditMode = !!knowledgeBaseToEdit;

  // Carregar agentes disponíveis
  useEffect(() => {
    if (isOpen) {
      loadAgents();
      
      // Se estiver em modo de edição, preencher os campos
      if (isEditMode && knowledgeBaseToEdit) {
        setName(knowledgeBaseToEdit.file_name);
        setSelectedAgent(knowledgeBaseToEdit.agent_id);
      } else {
        // Limpar campos se for criação
        setName('');
        setSelectedFile(null);
        setSelectedAgent(null);
      }
    }
  }, [isOpen, isEditMode, knowledgeBaseToEdit]);

  const loadAgents = async () => {
    setLoadingAgents(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Obter tenant_id do usuário
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (tenantError || !tenantData) {
        throw new Error('Erro ao obter informações do tenant');
      }
      
      // Buscar agentes do tenant
      const { data: agentsData, error: agentsError } = await supabase
        .from('tenant_agents')
        .select('id, agent_name')
        .eq('tenant_id', tenantData.id)
        .eq('is_active', true)
        .order('agent_name');
      
      if (agentsError) {
        throw new Error('Erro ao buscar agentes');
      }
      
      setAgents(agentsData || []);
    } catch (error: any) {
      console.error('Erro ao carregar agentes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de agentes.',
        variant: 'destructive',
      });
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações para modo de criação
    if (!isEditMode) {
      if (!selectedFile) {
        toast({
          title: 'Erro',
          description: 'Por favor, selecione um arquivo para upload.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (!name) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe um nome para o arquivo.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Obter o usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Obter tenant_id do usuário
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (tenantError || !tenantData) {
        throw new Error('Erro ao obter informações do tenant');
      }

      // Modo de edição - apenas atualiza o vínculo com o agente
      if (isEditMode && knowledgeBaseToEdit) {
        logger.debug('Updating knowledge base agent link', {
          hasKnowledgeBaseId: !!knowledgeBaseToEdit.id,
          hasSelectedAgent: !!selectedAgent
        });
        
        const { error: updateError } = await supabase
          .from('tenant_agents_rag')
          .update({
            agent_id: selectedAgent
          })
          .eq('id', knowledgeBaseToEdit.id)
          .eq('tenant_id', tenantData.id); // Garantir que o registro pertence ao tenant

        if (updateError) {
          throw new Error(`Erro ao atualizar vínculo com agente: ${updateError.message}`);
        }

        toast({
          title: 'Sucesso',
          description: 'Vínculo com agente atualizado com sucesso!',
        });
        
        // Fechar o diálogo e notificar o sucesso
        onClose();
        onSuccess();
        setUploading(false);
        return;
      }
      
      // Modo de criação - cria um novo registro e faz upload do arquivo
      // Criar registro na tabela tenant_agents_rag
      const { data: ragData, error: ragError } = await supabase
        .from('tenant_agents_rag')
        .insert({
          file_name: name,
          status: 'pending',
          metadata: {
            original_name: selectedFile!.name,
            size: selectedFile!.size,
            type: selectedFile!.type,
            extension: selectedFile!.name.split('.').pop()
          },
          agent_id: selectedAgent, // Usando o agente selecionado
          tenant_id: tenantData.id // Usando tenant_id como coluna
        })
        .select()
        .single();

      if (ragError || !ragData) {
        throw new Error('Erro ao criar registro na base de conhecimento');
      }

      // Gerar um nome único para o arquivo
      const fileExtension = selectedFile!.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      
      // Caminho do arquivo no bucket: tenant_id/tenant_agents_rag_id/arquivo
      const filePath = `${tenantData.id}/${ragData.id}/${fileName}`;

      // Upload do arquivo para o bucket 'rag'
      const { error: uploadError } = await supabase
        .storage
        .from('rag')
        .upload(filePath, selectedFile!, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Se houver erro no upload, excluir o registro criado
        await supabase
          .from('tenant_agents_rag')
          .delete()
          .eq('id', ragData.id);
          
        throw new Error(`Erro ao fazer upload do arquivo: ${uploadError.message}`);
      }

      // Obter URL pública do arquivo
      const { data: publicUrlData } = supabase
        .storage
        .from('rag')
        .getPublicUrl(filePath);

      // Atualizar o registro com a URL do arquivo
      await supabase
        .from('tenant_agents_rag')
        .update({
          file_url: filePath,
          public_url: publicUrlData.publicUrl
        })
        .eq('id', ragData.id);

      toast({
        title: 'Sucesso',
        description: 'Arquivo enviado com sucesso!',
      });

      // Limpar o formulário
      setName('');
      setSelectedFile(null);
      setSelectedAgent(null);
      
      // Fechar o diálogo e notificar o sucesso
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao processar operação:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível completar a operação.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Vínculo com Agente' : 'Criar Base de Conhecimento'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Vincule esta base de conhecimento a um agente específico para enriquecer suas respostas.' 
              : 'Faça upload de documentos para enriquecer as respostas do seu agente.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              {isEditMode ? (
                <div className="col-span-3">
                  <Input
                    id="name"
                    value={name}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              ) : (
                <div className="col-span-3">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            {!isEditMode && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  Arquivo
                </Label>
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="relative overflow-hidden w-full"
                    >
                      <input
                        id="file"
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                      />
                      <Upload className="h-4 w-4 mr-2" />
                      {selectedFile ? selectedFile.name : 'Selecionar arquivo'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos suportados: PDF, DOC, DOCX, TXT, CSV, XLSX
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent" className="text-right">
                Vincular a Agente
              </Label>
              <div className="col-span-3">
                <Select 
                  value={selectedAgent || 'none'} 
                  onValueChange={(value) => setSelectedAgent(value === 'none' ? null : value)}
                >
                  <SelectTrigger id="agent" className="w-full">
                    <SelectValue placeholder="Selecione um agente (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum agente</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.agent_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Vincular esta base de conhecimento a um agente específico
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
              Cancelar
            </Button>
            <Button type="submit" className="px-6" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? 'Salvando...' : 'Criando...'}
                </>
              ) : (
                isEditMode ? 'Salvar' : 'Criar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
