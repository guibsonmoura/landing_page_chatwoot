// src/components/knowledge/KnowledgeBaseList.tsx
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getDocumentsByAgentId } from '@/lib/actions/knowledge.actions';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Definindo o tipo para um documento do agente
export type AgentDocument = {
  id: number;
  file_name: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  created_at: string;
  error_message?: string | null;
};

interface KnowledgeBaseListProps {
  agentId: string;
}

export function KnowledgeBaseList({ agentId }: KnowledgeBaseListProps) {
  const [documents, setDocuments] = useState<AgentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      setIsLoading(true);
      const result = await getDocumentsByAgentId(agentId);

      if (result.error) {
        toast.error('Erro ao buscar documentos', {
          description: result.error,
        });
        setDocuments([]);
      } else {
        setDocuments(result.data || []);
      }
      setIsLoading(false);
    }

    fetchDocuments();
  }, [agentId]);

  const handleProcessDocument = (documentId: number) => {
    // TODO: Chamar a Server Action para processar o documento
    toast.info(`Processando documento #${documentId}...`);
  };

  const getStatusVariant = (status: AgentDocument['status']) => {
    switch (status) {
      case 'uploaded':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'completed':
        return 'success';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Documentos da Base de Conhecimento</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Carregando documentos...</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum documento encontrado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Arquivo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Envio</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.file_name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(doc.status)}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleProcessDocument(doc.id)}
                      disabled={doc.status === 'processing' || doc.status === 'completed'}
                    >
                      Processar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
