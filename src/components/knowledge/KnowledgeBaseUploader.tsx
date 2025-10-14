// src/components/knowledge/KnowledgeBaseUploader.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import { createDocumentRecord } from '@/lib/actions/knowledge.actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];

const formSchema = z.object({
  file: z
    .any()
    .refine((files) => files?.length == 1, 'O arquivo é obrigatório.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `O tamanho máximo é 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Tipos de arquivo aceitos: .pdf, .txt, .md'
    ),
});

interface KnowledgeBaseUploaderProps {
  agentId: string;
  tenantId: string; // Precisamos do tenantId para construir o caminho
}

export function KnowledgeBaseUploader({ agentId, tenantId }: KnowledgeBaseUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const file = values.file[0] as File;
    if (!file) return;

    setIsUploading(true);
    toast.info('Iniciando upload do arquivo...');

    try {
      const filePath = `${tenantId}/${agentId}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('knowledge_base') // Nome do bucket
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Falha no upload: ${uploadError.message}`);
      }

      toast.success('Arquivo enviado com sucesso!', {
        description: 'O próximo passo é processar o arquivo para que o agente possa usá-lo.',
      });

            // Chamar a Server Action para criar o registro no banco de dados
      const recordResult = await createDocumentRecord({
        tenantId,
        agentId,
        fileName: file.name,
        storagePath: filePath,
      });

      if (recordResult.error) {
        // Se a criação do registro falhar, idealmente deveríamos tentar remover o arquivo do storage
        // para evitar arquivos órfãos. Por simplicidade, vamos apenas notificar o usuário.
        throw new Error(`Falha ao registrar o documento: ${recordResult.error}`);
      }

      toast.success('Arquivo enviado e registrado!', {
        description: 'O documento agora aparece na lista abaixo, pronto para ser processado.',
      });

      form.reset();

    } catch (error: any) {
      toast.error('Ocorreu um erro', {
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Documento</CardTitle>
        <CardDescription>
          Faça o upload de arquivos (PDF, TXT, MD) para a base de conhecimento deste agente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">Documento</Label>
            <Input
              id="file"
              type="file"
              disabled={isUploading}
              {...form.register('file')}
            />
          </div>
          {form.formState.errors.file && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.file.message?.toString()}
            </p>
          )}
          <Button type="submit" disabled={isUploading}>
            {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
