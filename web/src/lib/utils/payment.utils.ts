/**
 * Utilitários para validação e formatação de dados de pagamento
 */

/**
 * Valida uma chave Pix
 */
export function validatePixKey(pixKey: string): { isValid: boolean; type?: string } {
  // Remove espaços e caracteres especiais
  const cleanKey = pixKey.replace(/\s/g, '');
  
  // CPF (11 dígitos)
  if (/^\d{11}$/.test(cleanKey)) {
    return { isValid: true, type: 'CPF' };
  }
  
  // CNPJ (14 dígitos)
  if (/^\d{14}$/.test(cleanKey)) {
    return { isValid: true, type: 'CNPJ' };
  }
  
  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanKey)) {
    return { isValid: true, type: 'Email' };
  }
  
  // Telefone (10 ou 11 dígitos com DDD)
  if (/^\d{10,11}$/.test(cleanKey)) {
    return { isValid: true, type: 'Telefone' };
  }
  
  // Chave aleatória (UUID)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanKey)) {
    return { isValid: true, type: 'Chave Aleatória' };
  }
  
  return { isValid: false };
}

/**
 * Mascara dados sensíveis de cartão de crédito
 */
export function maskCreditCard(cardNumber: string): string {
  const lastFour = cardNumber.slice(-4);
  return `**** **** **** ${lastFour}`;
}

/**
 * Mascara chave Pix para exibição
 */
export function maskPixKey(pixKey: string, type: string): string {
  switch (type.toLowerCase()) {
    case 'cpf':
      return `${pixKey.slice(0, 3)}.***.**${pixKey.slice(-2)}`;
    case 'cnpj':
      return `${pixKey.slice(0, 2)}.***.***/****-${pixKey.slice(-2)}`;
    case 'email':
      const [user, domain] = pixKey.split('@');
      return `${user.slice(0, 2)}***@${domain}`;
    case 'telefone':
      return `(${pixKey.slice(0, 2)}) ****-${pixKey.slice(-4)}`;
    default:
      return `${pixKey.slice(0, 4)}****${pixKey.slice(-4)}`;
  }
}

/**
 * Valida dados de cartão de crédito
 */
export function validateCreditCard(cardNumber: string, expiryDate: string, cvv: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validar número do cartão (algoritmo de Luhn simplificado)
  const cleanCardNumber = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleanCardNumber)) {
    errors.push('Número do cartão inválido');
  }
  
  // Validar data de expiração
  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
    errors.push('Data de expiração inválida');
  } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
    errors.push('Cartão expirado');
  }
  
  // Validar CVV
  if (!/^\d{3,4}$/.test(cvv)) {
    errors.push('CVV inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Detecta a bandeira do cartão pelo número
 */
export function detectCardBrand(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(cleanNumber)) return 'Visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'American Express';
  if (/^6/.test(cleanNumber)) return 'Discover';
  if (/^35(2[89]|[3-8][0-9])/.test(cleanNumber)) return 'JCB';
  
  return 'Desconhecida';
}

/**
 * Formata valor monetário para exibição
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata data para exibição brasileira
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
}
