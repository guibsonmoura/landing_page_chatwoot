'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PlusCircle, MessageSquare, Trash2, Loader2 } from 'lucide-react';

import { type Channel } from '@/types/channel';
import { deleteChannel } from '@/lib/actions/channel.actions';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChannelCard } from '@/components/channels/ChannelCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { CreateChannelDialog } from '@/components/channels/CreateChannelDialog';
import { HeaderSetter } from '@/components/layout/HeaderSetter';


interface ChannelClientPageProps {
  initialChannels: Channel[];
}

export default function ChannelClientPage({ initialChannels }: ChannelClientPageProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // State for dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [channelToEdit, setChannelToEdit] = useState<Channel | null>(null);
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);

  const handleOpenCreateDialog = () => {
    setChannelToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (channel: Channel) => {
    setChannelToEdit(channel);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!channelToDelete) return;

    setIsDeleting(true);
    const result = await deleteChannel(channelToDelete.id);
    setIsDeleting(false);

    if (result.error) {
      toast.error('Erro ao deletar canal', { description: result.error });
    } else {
      toast.success('Canal deletado com sucesso!');
      router.refresh();
    }
    setChannelToDelete(null);
  };
  
  // Removido o getPlatformIcon pois agora está no componente ChannelCard

  return (
    <>
      <HeaderSetter title="Canais de Comunicação" subtitle="Conecte seu agente a diferentes plataformas de mensagens" />
      <CreateChannelDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        channelToEdit={channelToEdit}
      />

      <AlertDialog open={!!channelToDelete} onOpenChange={() => setChannelToDelete(null)}>
        <AlertDialogContent className="border-0 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente o canal
              <span className="font-bold text-slate-900 dark:text-white"> {channelToDelete?.platform} - {channelToDelete?.account}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeleting}
              className="border-slate-200 dark:border-slate-700"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Confirmar exclusão
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div />
          <Button 
            onClick={handleOpenCreateDialog}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px] text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Canal
          </Button>
        </div>

        {initialChannels.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {initialChannels.map((channel) => (
                <ChannelCard 
                  key={channel.id} 
                  channel={channel} 
                  onEdit={handleOpenEditDialog}
                  onDelete={setChannelToDelete}
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 mb-4">
                <MessageSquare className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">Nenhum canal encontrado</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
                Você ainda não criou nenhum canal. Crie seu primeiro canal para conectar seu agente a uma plataforma de mensagens.
              </p>
              <Button 
                onClick={handleOpenCreateDialog}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar meu primeiro canal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
