import { Edit, Trash2, Settings, User, Mail, Phone } from 'lucide-react';
import { type Attendant } from '@/types/attendant';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AttendantCardProps {
  attendant: Attendant;
  onEdit: (attendant: Attendant) => void;
  onDelete: (attendant: Attendant) => void;
}

export function AttendantCard({ attendant, onEdit, onDelete }: AttendantCardProps) {
  // Função para determinar o status do atendente
  const getStatusDetails = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return {
          label: 'Ativo',
          color: 'bg-green-500',
          textColor: 'text-green-700 dark:text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
        };
      case 'inactive':
        return {
          label: 'Inativo',
          color: 'bg-slate-500',
          textColor: 'text-slate-700 dark:text-slate-500',
          bgColor: 'bg-slate-50 dark:bg-slate-900/20',
          borderColor: 'border-slate-200 dark:border-slate-800',
        };
      case 'pending':
        return {
          label: 'Pendente',
          color: 'bg-amber-500',
          textColor: 'text-amber-700 dark:text-amber-500',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
        };
      default:
        return {
          label: 'Desconhecido',
          color: 'bg-slate-500',
          textColor: 'text-slate-700 dark:text-slate-500',
          bgColor: 'bg-slate-50 dark:bg-slate-900/20',
          borderColor: 'border-slate-200 dark:border-slate-800',
        };
    }
  };

  const statusDetails = getStatusDetails(attendant.status);

  return (
    <Card className="relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
      <div 
        className={`absolute top-0 left-0 right-0 h-3 ${statusDetails.color} z-10`} 
        style={{ marginTop: '-1px', width: 'calc(100% + 2px)', marginLeft: '-1px' }} 
      />
      
      <CardHeader className="p-5 pb-0 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {attendant.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`${statusDetails.bgColor} ${statusDetails.textColor} ${statusDetails.borderColor} font-normal`}
                >
                  <span className={`mr-1.5 h-2 w-2 rounded-full ${statusDetails.color}`}></span>
                  {statusDetails.label}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-slate-200 dark:border-slate-700 shadow-lg">
                <DropdownMenuLabel className="text-slate-500 dark:text-slate-400">Ações</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => onEdit(attendant)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit className="h-4 w-4 text-slate-500" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950 dark:focus:text-red-400 flex items-center gap-2 cursor-pointer"
                  onClick={() => onDelete(attendant)}
                >
                  <Trash2 className="h-4 w-4" />
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-4">
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col space-y-2">
            <div className="flex flex-col gap-3 p-3 rounded-md border bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {attendant.email}
                </span>
              </div>
              
              {attendant.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {attendant.phone}
                  </span>
                </div>
              )}
              
              {attendant.department && (
                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                  <Badge variant="outline" className="font-normal bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                    {attendant.department}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0">
        <Button
          variant="outline"
          size="default"
          onClick={() => onEdit(attendant)}
          className="w-full border-indigo-200 hover:border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:border-indigo-900 dark:hover:border-indigo-800 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 dark:text-indigo-500"
        >
          <Edit className="mr-1.5 h-4 w-4" />
          Editar Atendente
        </Button>
      </CardFooter>
    </Card>
  );
}
