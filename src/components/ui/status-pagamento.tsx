import React from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface PaymentStatusModalProps {
  isOpen: boolean;
  status: string;
  onClose: () => void;
}

const statusConfig = {
  success: {
    icon: <CheckCircle className="text-green-500 w-16 h-16" />,
    title: "Pagamento bem-sucedido!",
    message: "Seu pagamento foi processado com sucesso.",
    color: "bg-green-100",
  },
  pending: {
    icon: <Clock className="text-yellow-500 w-16 h-16" />,
    title: "Pagamento pendente",
    message: "Seu pagamento está sendo processado. Aguarde a confirmação.",
    color: "bg-yellow-100",
  },
  failed: {
    icon: <XCircle className="text-red-500 w-16 h-16" />,
    title: "Falha no pagamento",
    message: "Não foi possível processar o pagamento. Tente novamente.",
    color: "bg-red-100",
  },
};

export const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  isOpen,
  status,
  onClose,
}) => {
  if (!isOpen) return null;

  const { icon, title, message, color } = statusConfig[status];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div
        className={`rounded-2xl shadow-lg p-8 w-96 text-center ${color} animate-fade-in`}
      >
        <div className="flex justify-center mb-4">{icon}</div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
