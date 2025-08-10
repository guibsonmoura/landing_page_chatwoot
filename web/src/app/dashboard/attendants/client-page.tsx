'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2, Edit, User, ExternalLink } from 'lucide-react';
import { Attendant } from '@/types/attendant';
import { deleteAttendant } from '@/lib/actions/attendant.actions';

import { Button } from '@/components/ui/button';
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
import { Card, CardContent } from '@/components/ui/card';
import { AttendantCard } from '@/components/attendants/AttendantCard';
import { CreateAttendantModal } from '@/components/attendants/CreateAttendantModal';
import { HeaderSetter } from '@/components/layout/HeaderSetter';

interface AttendantClientPageProps {
  initialAttendants: Attendant[];
  chatUrl?: string;
}

export default function AttendantClientPage({ initialAttendants, chatUrl }: AttendantClientPageProps) {
  const router = useRouter();
  const [attendants, setAttendants] = useState<Attendant[]>(initialAttendants);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAttendant, setSelectedAttendant] = useState<Attendant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Função para abrir o modal de criação
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  // Função para abrir o modal de edição
  const handleEditAttendant = (attendant: Attendant) => {
    setSelectedAttendant(attendant);
    setIsEditModalOpen(true);
  };

  // Função para abrir o diálogo de confirmação de exclusão
  const handleDeleteAttendant = (attendant: Attendant) => {
    setSelectedAttendant(attendant);
    setIsDeleteDialogOpen(true);
  };

  // Função para confirmar a exclusão
  const confirmDelete = async () => {
    if (!selectedAttendant) return;

    setIsDeleting(true);
    try {
      const { error } = await deleteAttendant(selectedAttendant.id);
      
      if (error) {
        console.error('Erro ao deletar atendente:', error);
        // Implementar notificação de erro aqui
      } else {
        // Atualiza a lista local removendo o atendente deletado
        setAttendants(attendants.filter(a => a.id !== selectedAttendant.id));
        // Força a revalidação dos dados
        router.refresh();
      }
    } catch (error) {
      console.error('Erro ao deletar atendente:', error);
      // Implementar notificação de erro aqui
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedAttendant(null);
    }
  };

  // Função para atualizar a lista de atendentes após criação
  const handleAttendantCreated = (newAttendant: Attendant) => {
    setAttendants([...attendants, newAttendant]);
    router.refresh();
  };

  // Função para atualizar a lista de atendentes após edição
  const handleAttendantUpdated = (updatedAttendant: Attendant) => {
    setAttendants(attendants.map(a => 
      a.id === updatedAttendant.id ? updatedAttendant : a
    ));
    router.refresh();
  };

  return (
    <div className="container mx-auto p-6">
      <HeaderSetter title="Atendentes" subtitle="Gerencie sua equipe de atendentes humanos" />

      <div className="flex justify-between items-center mb-6">
        <div />
        <Button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Novo Atendente
        </Button>
      </div>

      {attendants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attendants.map((attendant) => (
            <AttendantCard
              key={attendant.id}
              attendant={attendant}
              onEdit={handleEditAttendant}
              onDelete={handleDeleteAttendant}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-500 dark:text-slate-400">
          Nenhum atendente cadastrado ainda.
        </div>
      )}

      {/* Modais e diálogos */}
      <CreateAttendantModal 
        isOpen={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onAttendantCreated={handleAttendantCreated}
      />

      <CreateAttendantModal 
        isOpen={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        onAttendantUpdated={handleAttendantUpdated}
        attendant={selectedAttendant}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este atendente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600 text-white">
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
