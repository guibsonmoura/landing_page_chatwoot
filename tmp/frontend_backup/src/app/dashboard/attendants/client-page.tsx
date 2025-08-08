'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2, Edit, User } from 'lucide-react';
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
import { AttendantCard } from '@/components/attendants/AttendantCard';
import { CreateAttendantModal } from '@/components/attendants/CreateAttendantModal';

interface AttendantClientPageProps {
  initialAttendants: Attendant[];
}

export default function AttendantClientPage({ initialAttendants }: AttendantClientPageProps) {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Atendentes
        </h1>
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
        <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-slate-500 dark:text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            Nenhum atendente cadastrado
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-4">
            Crie seu primeiro atendente para começar a gerenciar sua equipe.
          </p>
          <Button 
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Criar Atendente
          </Button>
        </div>
      )}

      {/* Modal de criação de atendente */}
      {isCreateModalOpen && (
        <CreateAttendantModal
          isOpen={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onAttendantCreated={handleAttendantCreated}
        />
      )}

      {/* Modal de edição de atendente */}
      {isEditModalOpen && selectedAttendant && (
        <CreateAttendantModal
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onAttendantUpdated={handleAttendantUpdated}
          attendant={selectedAttendant}
        />
      )}

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Tem certeza que deseja excluir o atendente{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {selectedAttendant?.name}
              </span>?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-3">
            <AlertDialogCancel 
              disabled={isDeleting}
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white px-6"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
