'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Check, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { updateWhatsAppConnectionStatus } from '@/lib/actions/whatsapp.actions';
import logger from '@/lib/logger';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface QRCodeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  agentId: string | null;
  phoneNumber: string;
}

export function QRCodeModal({ 
  isOpen, 
  onOpenChange, 
  channelId, 
  agentId,
  phoneNumber
}: QRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isConnected, setIsConnected] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  
  // Função para buscar o QR Code do webhook
  const fetchQRCode = async () => {
    if (!channelId) {
      setError('ID do canal não fornecido.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsExpired(false);
    
    try {
      logger.debug('QRCode fetch initiated', {
        hasChannelId: !!channelId,
        hasPhoneNumber: !!phoneNumber
      });
      
      // Usar o proxy de API local para contornar problemas de CORS
      const proxyUrl = '/api/whatsapp-proxy';
      logger.debug('Using proxy URL for QRCode request');
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: 'qrcode',
          channelId: channelId,
          phone: phoneNumber
        }),
      });
      
      logger.debug('QRCode request response received', { status: response.status });
      
      if (!response.ok) {
        throw new Error('Falha ao obter o QR Code. Tente novamente.');
      }
      
      // Obter o texto da resposta primeiro
      const responseText = await response.text();
      logger.debug('Webhook response received', {
        hasResponseText: !!responseText,
        responseLength: responseText.length
      });
      
      let responseData;
      
      // Para depuração/testes quando o webhook não estiver disponível
      if (process.env.NODE_ENV === 'development' && responseText.trim() === '') {
        logger.debug('Development environment detected with empty response - using mock data');
        responseData = {
          "pairingCode": null,
          "code": "2@eyTgu8+6yUhrPXw3192MNcUfvsUSDIVKf2AbyKsQyPGXQ4CYojV7e04AQrKMKl2YKWFdflaMuhynNEFke/8yWvsJUDjaypv2ZLE=",
          "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVwAAAFcCAYAAACEFgYsAAAAAklEQVR4AewaftIAABDSSURBVO3BQY4kSXIgQdVA/f/Lug0eHHZyIJBZPdM7Zu7u/7DWeg2XtdZzuKy1nsNlrfUcLmut53BZaz2Hy1rrOVzWWs/hstZ6Dpe11nO4rLWew2Wt9RwuA"
        };
      }
      
      // Se já temos um mock definido, pule o processamento da resposta
      if (!responseData) {
        // Verificar se o texto começa com data:image (base64 direto)
        if (responseText.trim().startsWith('data:image')) {
          logger.debug('Direct base64 image response detected');
          responseData = { type: 'base64', return: responseText.trim() };
        } else {
          try {
            // Tente fazer o parse como JSON
            logger.debug('Attempting JSON parse of response');
            const data = JSON.parse(responseText);
            logger.debug('JSON parse successful', { dataType: typeof data });
            
            // Verificar se é um array e pegar o primeiro item
            responseData = Array.isArray(data) ? data[0] : data;
            logger.debug('Response data processed', {
              hasResponseData: !!responseData,
              responseKeys: responseData ? Object.keys(responseData) : []
            });
            
            // Verificar o formato da resposta
            if (responseData.type === 'base64' && responseData.return) {
              logger.debug('QR Code found in new format (type: base64)');
            } else if (responseData.type === 'status' && responseData.return === 'open') {
              logger.debug('Instance already connected (type: status, return: open)');
            } else if (responseData.type === 'message' && responseData.return === 'connected') {
              logger.debug('WhatsApp connected successfully (type: message, return: connected)');
            } else if (responseData.base64) {
              // Formato antigo, manter compatibilidade
              logger.debug('Base64 field found in legacy format');
              responseData = { type: 'base64', return: responseData.base64 };
            } else {
              logger.debug('Server response processed', {
                hasResponseData: !!responseData,
                responseType: responseData?.type || 'unknown'
              });
            }
          } catch (error) {
            console.error('Erro ao processar resposta como JSON:', error);
            throw new Error(`Formato de resposta inválido do servidor: ${responseText.substring(0, 50)}...`);
          }
        }
      }
      
      // Verificar o formato da resposta do novo webhook
      if (Array.isArray(responseData) && responseData.length > 0) {
        const statusInfo = responseData[0];
        
        if (statusInfo.status === 'open') {
          logger.debug('Channel already connected');
          setIsConnected(true);
          setQrCodeUrl(null);
          // Atualizar o status de conexão no banco de dados
          await updateWhatsAppConnectionStatus(channelId, true);
        }
        else if (statusInfo.status === 'close' && statusInfo.base64) {
          logger.debug('QR Code found');
          setQrCodeUrl(statusInfo.base64);
          setTimeLeft(45);
          setIsConnected(false);
          // Iniciar verificação periódica do status
          startStatusCheck();
        }
        else if (statusInfo.status === 'connecting') {
          logger.debug('WhatsApp connection in progress');
          setQrCodeUrl(statusInfo.base64 || null);
          setIsConnected(false);
        }
      }
      // Manter compatibilidade com formatos anteriores
      else if (responseData.type === 'status' && responseData.return === 'open') {
        logger.debug('Channel already connected (legacy format)');
        setIsConnected(true);
        setQrCodeUrl(null);
        await updateWhatsAppConnectionStatus(channelId, true);
      }
      else if (responseData.type === 'message' && responseData.return === 'connected') {
        logger.debug('WhatsApp connected successfully (legacy format)');
        setIsConnected(true);
        setQrCodeUrl(null);
        await updateWhatsAppConnectionStatus(channelId, true);
      }
      else if (responseData.type === 'base64' && responseData.return) {
        logger.debug('QR Code found (legacy format)');

        setQrCodeUrl(responseData.return);
        setTimeLeft(45);
        setIsConnected(false);
        // Iniciar verificação periódica do status
        startStatusCheck();
      }
      // Verificar formato antigo: se o código existe e não há código de pareamento (já conectado)
      else if (responseData.code && !responseData.pairingCode) {
        logger.debug('Channel already connected (legacy format)');
        setIsConnected(true);
        setQrCodeUrl(null);
        // Atualizar o status de conexão no banco de dados
        await updateWhatsAppConnectionStatus(channelId, true);
      } 
      // Verificar formato antigo: QR Code em base64
      else if (responseData.base64) {
        logger.debug('QR Code found in base64 format (legacy)');
        setQrCodeUrl(responseData.base64);
        setTimeLeft(45);
        setIsConnected(false);
        // Iniciar verificação periódica do status
        startStatusCheck();
      } 
      // Verificar se há código de pareamento (não suportado ainda)
      else if (responseData.pairingCode) {
        logger.debug('Pairing code found but not supported');
        throw new Error('Formato de pareamento não suportado nesta versão.');
      } 
      // Nenhum formato reconhecido
      else {
        console.error('Formato de resposta não reconhecido:', responseData);
        throw new Error('QR Code não encontrado na resposta. Verifique o formato retornado pelo webhook.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para verificar o status da conexão WhatsApp
  const checkConnectionStatus = async () => {
    if (!channelId) return;
    
    try {
      logger.debug('QRCodeModal checking connection status', {
        hasChannelId: !!channelId,
        hasPhoneNumber: !!phoneNumber
      });
      
      // Usar o proxy de API local para contornar problemas de CORS
      const proxyUrl = '/api/whatsapp-proxy';
      logger.debug('QRCodeModal using proxy URL for status check');
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: 'state',
          channelId: channelId,
          phone: phoneNumber || ''
        })
      });
      
      logger.debug('QRCodeModal status check response received', { status: response.status });

      if (!response.ok) {
        logger.error('QRCodeModal failed to check WhatsApp status');
        return;
      }

      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        const statusInfo = Array.isArray(data) ? data[0] : data;
        
        if (statusInfo && statusInfo.status === 'open') {
          logger.info('QRCodeModal WhatsApp connected successfully');
          setIsConnected(true);
          setQrCodeUrl(null);
          // Atualizar o status de conexão no banco de dados
          await updateWhatsAppConnectionStatus(channelId, true);
          // Parar a verificação periódica
          stopStatusCheck();
        }
      } catch (error) {
        logger.error('QRCodeModal failed to process status response', { hasError: !!error });
      }
    } catch (error) {
      logger.error('QRCodeModal failed to check WhatsApp status', { hasError: !!error });
    }
  };
  
  // Referência para o intervalo de verificação de status
  const statusCheckRef = useRef<NodeJS.Timeout | null>(null);
  
  // Iniciar verificação periódica do status
  const startStatusCheck = () => {
    // Limpar qualquer verificação existente
    stopStatusCheck();
    
    logger.debug('QRCodeModal starting periodic status check every 10 seconds');
    
    // Verificar imediatamente uma vez
    checkConnectionStatus();
    
    // Iniciar nova verificação a cada 10 segundos
    statusCheckRef.current = setInterval(() => {
      logger.debug('QRCodeModal executing periodic status check');
      if (!isConnected && !isExpired) {
        checkConnectionStatus();
      } else {
        logger.debug('QRCodeModal stopping periodic check', {
          reason: isConnected ? 'connected' : 'expired'
        });
        stopStatusCheck();
      }
    }, 10000); // 10 segundos
  };
  
  // Parar verificação periódica do status
  const stopStatusCheck = () => {
    if (statusCheckRef.current) {
      clearInterval(statusCheckRef.current);
      statusCheckRef.current = null;
    }
  };
  
  // Efeito para iniciar o contador regressivo quando o QR Code é carregado
  useEffect(() => {
    if (!qrCodeUrl || isExpired || isConnected) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [qrCodeUrl, isExpired, isConnected]);
  
  // Limpar verificação de status quando o componente é desmontado
  useEffect(() => {
    return () => stopStatusCheck();
  }, []);
  
  // Verificar status de conexão periodicamente quando conectado
  useEffect(() => {
    let statusCheckTimer: NodeJS.Timeout;
    
    if (isConnected) {
      logger.info('QRCodeModal channel connected successfully - updating status');
      // Atualizar o status de conexão no banco de dados quando conectado
      updateWhatsAppConnectionStatus(channelId, true)
        .then(() => logger.info('QRCodeModal connection status updated successfully'))
        .catch(err => logger.error('QRCodeModal failed to update connection status', { hasError: !!err }));
      
      // Fechar o modal automaticamente após 3 segundos quando conectado
      statusCheckTimer = setTimeout(() => {
        logger.debug('QRCodeModal closing after successful connection');
        onOpenChange(false);
      }, 3000);
    }
    
    return () => {
      if (statusCheckTimer) clearTimeout(statusCheckTimer);
    };
  }, [isConnected, channelId, onOpenChange]);
  
  // Buscar o QR Code quando o modal é aberto
  useEffect(() => {
    if (isOpen && !isConnected) {
      logger.debug('QRCodeModal opened - fetching QR Code');
      fetchQRCode();
      
      // Limpar verificação de status quando o modal for fechado
      return () => {
        logger.debug('QRCodeModal closed - stopping status check');
        stopStatusCheck();
      };
    }
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
            Conectar WhatsApp
          </DialogTitle>
          <DialogDescription>
            Escaneie o QR Code com seu WhatsApp para conectar sua conta.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Carregando QR Code...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive font-medium mb-2">Erro ao Conectar</p>
              <p className="text-muted-foreground text-center">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={fetchQRCode}
              >
                Tentar novamente
              </Button>
            </div>
          ) : isConnected ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Check className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-green-600 font-medium mb-2">Conectado com sucesso!</p>
              <p className="text-muted-foreground text-center">
                Seu WhatsApp foi conectado com sucesso.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Esta janela será fechada automaticamente...
              </p>
              <div className="flex justify-end w-full mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="px-6"
                >
                  Fechar
                </Button>
              </div>
            </div>
          ) : qrCodeUrl ? (
            <div className="flex flex-col items-center justify-center">
              <div className="relative p-4 bg-white rounded-lg shadow-md mb-4">
                {/* Usar img diretamente para base64 para evitar problemas com o Next.js Image */}
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code WhatsApp" 
                  width={200} 
                  height={200} 
                  className="rounded-md"
                  style={{ imageRendering: 'pixelated' }}
                />
                {isExpired && (
                  <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                    <p className="text-white font-medium">QR Code expirado</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-2 text-center">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
                  {timeLeft}s
                </p>
                <p className="text-sm text-muted-foreground">
                  Escaneie o QR Code com seu WhatsApp:
                </p>
                <ol className="text-xs text-left text-muted-foreground mt-2 list-decimal pl-5 space-y-1">
                  <li>Abra o WhatsApp no seu telefone</li>
                  <li>Toque em Menu ou Configurações e selecione WhatsApp Web</li>
                  <li>Aponte seu telefone para esta tela para capturar o código</li>
                </ol>
                <div className="flex justify-end items-center gap-3 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  {isExpired && (
                    <Button
                      type="button"
                      variant="default"
                      onClick={fetchQRCode}
                      disabled={isLoading}
                      className="px-6"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>Gerar novo QR Code</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>


        {/* O footer foi movido para dentro de cada seção de conteúdo para melhor controle do layout */}
      </DialogContent>
    </Dialog>
  );
}
