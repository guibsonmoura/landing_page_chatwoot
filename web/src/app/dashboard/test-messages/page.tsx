'use client';

import { useState } from 'react';
import { insertTestMessages, checkExistingMessages } from '@/lib/actions/test-messages.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestMessagesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleInsertTestData = async () => {
    setLoading(true);
    try {
      const result = await insertTestMessages();
      setResult(result);
    } catch (error) {
      setResult({ error: 'Erro ao inserir dados de teste' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckData = async () => {
    setLoading(true);
    try {
      const result = await checkExistingMessages();
      setResult(result);
    } catch (error) {
      setResult({ error: 'Erro ao verificar dados' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste do Sistema de Mensagens</CardTitle>
          <CardDescription>
            Use esta página para inserir dados de teste e verificar o funcionamento do sistema de mensagens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleInsertTestData} 
              disabled={loading}
              variant="default"
            >
              {loading ? 'Inserindo...' : 'Inserir Dados de Teste'}
            </Button>
            
            <Button 
              onClick={handleCheckData} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Verificando...' : 'Verificar Dados Existentes'}
            </Button>
          </div>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resultado:</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-muted-foreground">
            <p><strong>Instruções:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Clique em "Inserir Dados de Teste" para criar mensagens de exemplo</li>
              <li>Clique em "Verificar Dados Existentes" para ver o status atual</li>
              <li>Após inserir os dados, volte para o dashboard e verifique o sino de notificações</li>
              <li>Esta página pode ser removida após os testes</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
