'use client';

import React, { useState } from 'react';
import { Database, Upload, File, Trash2, AlertCircle, CheckCircle, Play, Edit, Link, Loader2 } from 'lucide-react';
import { CreateKnowledgeBaseDialog } from '@/components/knowledge-base/CreateKnowledgeBaseDialog';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { clsx } from 'clsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAgentStore } from '@/stores/agentStore';
import { v4 as uuidv4 } from 'uuid';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import logger from '@/lib/logger';

export default function KnowledgeBasePage() {
  const [uploading, setUploading] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<number[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{id: number, url: string, name: string} | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<{id: number, file_name: string, agent_id: string | null} | null>(null);
  const { toast } = useToast();
  const { selectedAgent: agent } = useAgentStore();
  const supabase = createClient();

  // Função para buscar todos os arquivos da base de conhecimento
  const fetchFiles = async () => {
    try {
      logger.debug('KnowledgeBasePage fetching files');
      
      // Usar o cliente Supabase diretamente em vez de fazer uma chamada fetch
      const { data, error } = await supabase
        .from('tenant_agents_rag')
        .select(`
          *,
          agent:agent_id (id, agent_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      logger.debug('KnowledgeBasePage files found', { count: data?.length || 0 });
      setFiles(data || []);
    } catch (error: any) {
      logger.error('KnowledgeBasePage failed to fetch files', { hasError: !!error });
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os arquivos.',
        variant: 'destructive',
      });
    }
  };

  // Carregar arquivos e configurar a escuta em tempo real
  React.useEffect(() => {
    fetchFiles();

    const channel = supabase
      .channel('tenant_agents_rag_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tenant_agents_rag' },
        (payload) => {
          logger.debug('KnowledgeBasePage realtime payload received');
          const updatedFile = payload.new as any;

          if (!updatedFile || !updatedFile.id) {
            logger.error('KnowledgeBasePage realtime invalid payload', { hasPayload: !!payload });
            return;
          }

          logger.debug('KnowledgeBasePage realtime file updated', { hasId: !!updatedFile.id, status: updatedFile.status });

          setFiles((currentFiles) => {
            logger.debug('KnowledgeBasePage realtime updating file state');
            const newFiles = currentFiles.map((file) =>
              file.id === updatedFile.id ? { ...file, ...updatedFile } : file
            );
            logger.debug('KnowledgeBasePage realtime file state updated', { totalFiles: newFiles.length });
            return newFiles;
          });

          setProcessingFiles(prev => {
            logger.debug('KnowledgeBasePage realtime removing from processing list', { hasId: !!updatedFile.id });
            const newProcessing = prev.filter(id => id !== updatedFile.id);
            return newProcessing;
          });
        }
      )
      .subscribe();

    // Limpeza ao desmontar o componente
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    // Precisamos obter o tenant_id do usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    // Obter tenant_id do usuário (da tabela tenants, não users)
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (tenantError || !tenantData) {
      throw new Error('Erro ao obter informações do tenant');
    }
    
    logger.debug('KnowledgeBasePage tenant data loaded', { hasTenantData: !!tenantData });
    logger.debug('KnowledgeBasePage file data', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type, 
      fileExt,
      hasAgentId: !!(selectedAgent?.id) 
    });
    
    // Primeiro vamos criar o registro na tabela para obter o ID
    // Variável para armazenar os dados do registro
    let ragData;
    
    try {
      const { data, error: ragError } = await supabase
        .from('tenant_agents_rag')
        .insert({
          file_name: file.name,
          status: 'pending',
          metadata: {
            size: file.size,
            type: file.type,
            extension: fileExt
          },
          agent_id: selectedAgent?.id || null,
          tenant_id: tenantData.id // Usando tenant_id como coluna
        })
        .select()
        .single();
      
      ragData = data; // Armazenando os dados na variável externa
      
      logger.debug('KnowledgeBasePage insertion response', { hasData: !!data, hasError: !!ragError });
      
      if (ragError) {
        logger.error('KnowledgeBasePage failed to create record', { hasError: !!ragError });
        throw new Error(`Erro ao criar registro: ${ragError.message}`);
      }
      
      if (!data) {
        throw new Error('Nenhum dado retornado ao criar registro');
      }
    } catch (error) {
      logger.error('KnowledgeBasePage exception creating record', { hasError: !!error });
      throw error;
    }
    
    // Agora podemos criar o caminho correto para o arquivo
    const filePath = `${tenantData.id}/${ragData.id}/${fileName}`;

    setUploading(true);

    try {
      // 1. Fazer upload do arquivo para o bucket
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('rag')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obter URL pública do arquivo
      const { data: urlData } = await supabase.storage
        .from('rag')
        .getPublicUrl(filePath);

      // 3. Atualizar o registro na tabela tenant_agents_rag com a URL do arquivo
      const { error: updateError } = await supabase
        .from('tenant_agents_rag')
        .update({
          file_url: urlData.publicUrl
        })
        .eq('id', ragData.id);        
        
      if (updateError) {
        throw new Error('Erro ao atualizar registro com URL do arquivo');
      }
      
      // Buscar os arquivos atualizados
      await fetchFiles();

      toast({
        title: 'Arquivo enviado com sucesso',
        description: 'O arquivo será processado em breve.',
        variant: 'default',
      });

      // Recarregar a lista de arquivos
      fetchFiles();
    } catch (error: any) {
      logger.error('KnowledgeBasePage upload failed', { hasError: !!error });
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível enviar o arquivo.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Limpar o input de arquivo
      event.target.value = '';
    }
  };

  // Função para processar um arquivo da base de conhecimento
  const handleProcessFile = async (id: number) => {
    setProcessingFiles((prev) => [...prev, id]);
    toast({
      title: 'Processamento iniciado',
      description: 'O arquivo está sendo processado. Isso pode levar alguns minutos.',
      variant: 'default',
    });
    try {
      logger.debug('KnowledgeBasePage processing file', { hasId: !!id });
      
      // Obter o tenant_id do usuário autenticado
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
      
      logger.debug('KnowledgeBasePage tenant ID obtained', { hasTenantId: !!tenantData.id });
      
      logger.debug('KnowledgeBasePage sending RAG processing request');
      
      // A chamada fetch padrão enviará os cookies de sessão que o backend irá validar.
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenant_agents_rag_id: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Usa a mensagem de erro do backend ou uma mensagem padrão
        throw new Error(result.error || 'Erro ao iniciar o processamento do arquivo.');
      }

      toast({
        title: 'Sucesso',
        description: 'O arquivo foi enviado para processamento.',
        variant: 'default',
      });

      // Atualizar a lista de arquivos para refletir o status 'processing'
      await fetchFiles();
    } catch (error: any) {
      console.error('Erro ao processar arquivo:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível processar o arquivo.',
        variant: 'destructive',
      });
    } finally {
      setProcessingFiles((prev) => prev.filter((fileId) => fileId !== id));
    }
  };

  const confirmDelete = async () => {
    console.log('CONFIRM_DELETE - INÍCIO', fileToDelete);
    if (!fileToDelete) return;
    
    const { id, url: filePath, name: fileName } = fileToDelete;
    
    try {      
      console.log('CONFIRM_DELETE - INICIANDO EXCLUSÃO DO REGISTRO NO BANCO');
      
      // Excluir o registro do banco de dados
      const deleteResult = await supabase
        .from('tenant_agents_rag')
        .delete()
        .eq('id', id);
      
      console.log('CONFIRM_DELETE - RESULTADO DA EXCLUSÃO DO REGISTRO:', deleteResult);
        
      if (deleteResult.error) {
        console.error('CONFIRM_DELETE - ERRO AO EXCLUIR REGISTRO:', deleteResult.error);
        throw new Error(`Erro ao excluir registro: ${deleteResult.error.message}`);
      }

      console.log('CONFIRM_DELETE - REGISTRO EXCLUÍDO COM SUCESSO');
      console.log('CONFIRM_DELETE - EXTRAINDO CAMINHO DO ARQUIVO NO BUCKET');
      
      // Extrair o caminho do arquivo no bucket a partir da URL
      let bucketPath = '';
      console.log('CONFIRM_DELETE - URL DO ARQUIVO:', filePath);
      
      if (filePath && filePath.includes('/rag/')) {
        const parts = filePath.split('/rag/');
        if (parts.length > 1) {
          bucketPath = parts[1];
          console.log('CONFIRM_DELETE - CAMINHO EXTRAÍDO:', bucketPath);
        } else {
          console.log('CONFIRM_DELETE - NÃO FOI POSSÍVEL EXTRAIR O CAMINHO (parts.length <= 1)');
        }
      } else {
        console.log('CONFIRM_DELETE - URL NÃO CONTÉM "/rag/"');
      }

      // Excluir o arquivo do bucket
      if (bucketPath) {
        console.log('CONFIRM_DELETE - INICIANDO EXCLUSÃO DO ARQUIVO NO BUCKET');
        
        const storageResult = await supabase
          .storage
          .from('rag')
          .remove([bucketPath]);
        
        console.log('CONFIRM_DELETE - RESULTADO DA EXCLUSÃO DO ARQUIVO:', storageResult);
          
        if (storageResult.error) {
          console.error('CONFIRM_DELETE - ERRO AO EXCLUIR ARQUIVO DO BUCKET:', storageResult.error);
          // Continuamos mesmo com erro no storage, pois o registro já foi excluído
        } else {
          console.log('CONFIRM_DELETE - ARQUIVO EXCLUÍDO DO BUCKET COM SUCESSO');
        }
      } else {
        console.warn('CONFIRM_DELETE - CAMINHO DO ARQUIVO NÃO IDENTIFICADO, PULANDO EXCLUSÃO DO BUCKET');
      }

      console.log('CONFIRM_DELETE - EXIBINDO TOAST DE SUCESSO');
      toast({
        title: 'Arquivo excluído',
        description: 'O arquivo foi removido com sucesso.',
        variant: 'default',
      });

      console.log('CONFIRM_DELETE - ATUALIZANDO LISTA DE ARQUIVOS');
      // Atualizar a lista de arquivos
      await fetchFiles();
      console.log('CONFIRM_DELETE - LISTA DE ARQUIVOS ATUALIZADA');
      
      console.log('CONFIRM_DELETE - PROCESSO DE EXCLUSÃO CONCLUÍDO COM SUCESSO');
    } catch (error: any) {
      console.error('CONFIRM_DELETE - ERRO GERAL:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir o arquivo.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  // Função para abrir o diálogo de edição de vínculo com agente
  const handleEditFile = (id: number, file_name: string, agent_id: string | null) => {
    console.log('HANDLE_EDIT_FILE - PREPARANDO DIÁLOGO', { id, file_name, agent_id });
    setFileToEdit({ id, file_name, agent_id });
    setEditDialogOpen(true);
  };

  const handleDeleteFile = (id: number, filePath: string, fileName: string) => {
    console.log('HANDLE_DELETE_FILE - PREPARANDO DIÁLOGO', { id, filePath, fileName });
    setFileToDelete({ id, url: filePath, name: fileName });
    setDeleteDialogOpen(true);
  };

  // Função para renderizar o status do arquivo
  const renderStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertCircle className="h-3 w-3" />
            <span>Pendente</span>
          </Badge>
        );
      case 'processed':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3" />
            <span>Processado</span>
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3" />
            <span>Erro</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <span>{status}</span>
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Base de Conhecimento</h1>
        <p className="text-muted-foreground">
          Gerencie os documentos para enriquecer as respostas dos seus agentes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span>Documentos do Agente</span>
          </CardTitle>
          <CardDescription>
            Faça upload de documentos para melhorar as respostas do seu agente com informações específicas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {
            <>
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    className="relative overflow-hidden"
                    disabled={uploading}
                  >
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                    />
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Enviando...' : 'Enviar Documento'}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Formatos suportados: PDF, DOC, DOCX, TXT, CSV, XLSX
                  </p>
                </div>
              </div>

              {files.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>Data de Upload</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Agente</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          {file.file_name}
                        </TableCell>
                        <TableCell>
                          {new Date(file.created_at).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={clsx({
                              'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-800/20 dark:text-yellow-500':
                                file.status === 'pending',
                              'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800/20 dark:text-green-500':
                                file.status === 'processed',
                            })}
                          >
                            {file.status === 'pending' ? 'Pendente' : file.status === 'processed' ? 'Processado' : file.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {file.agent_id ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                              <Link className="h-3 w-3" />
                              {file.agent?.agent_name || 'Agente vinculado'}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Sem vínculo</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {file.status !== 'processed' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleProcessFile(file.id)}
                                title="Processar documento"
                                disabled={processingFiles.includes(file.id)}
                              >
                                {processingFiles.includes(file.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditFile(file.id, file.file_name, file.agent_id)}
                              title="Editar vínculo com agente"
                            >
                              <Link className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteFile(file.id, file.file_url, file.file_name)}
                              title="Excluir documento"
                              data-testid={`delete-btn-${file.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 border rounded-md bg-muted/10">
                  <File className="mx-auto h-12 w-12 mb-4 text-muted-foreground/60" />
                  <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Faça upload de documentos para enriquecer as respostas do seu agente.
                  </p>
                </div>
              )}
            </>
          }
        </CardContent>
      </Card>
      
      {/* Diálogo de edição de vínculo com agente */}
      <CreateKnowledgeBaseDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={() => {
          setEditDialogOpen(false);
          fetchFiles();
          toast({
            title: 'Vínculo atualizado',
            description: 'O vínculo com o agente foi atualizado com sucesso.',
            variant: 'default',
          });
        }}
        knowledgeBaseToEdit={fileToEdit}
      />
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              {fileToDelete && (
                <>Esta ação não pode ser desfeita. Isso irá deletar permanentemente o arquivo <span className="font-bold">{fileToDelete.name}</span>.</>  
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Confirmar exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
