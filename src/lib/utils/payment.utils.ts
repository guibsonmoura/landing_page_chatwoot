
export function validatePixKey(pixKey: string): { isValid: boolean; type?: string } {

  const cleanKey = pixKey.replace(/\s/g, '');
  

  if (/^\d{11}$/.test(cleanKey)) {
    return { isValid: true, type: 'CPF' };
  }
  

  if (/^\d{14}$/.test(cleanKey)) {
    return { isValid: true, type: 'CNPJ' };
  }
  

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanKey)) {
    return { isValid: true, type: 'Email' };
  }
  

  if (/^\d{10,11}$/.test(cleanKey)) {
    return { isValid: true, type: 'Telefone' };
  }
  

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanKey)) {
    return { isValid: true, type: 'Chave Aleatória' };
  }
  
  return { isValid: false };
}


export function maskCreditCard(cardNumber: string): string {
  const lastFour = cardNumber.slice(-4);
  return `**** **** **** ${lastFour}`;
}


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


export function validateCreditCard(cardNumber: string, expiryDate: string, cvv: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  

  const cleanCardNumber = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleanCardNumber)) {
    errors.push('Número do cartão inválido');
  }
  

  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
    errors.push('Data de expiração inválida');
  } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
    errors.push('Cartão expirado');
  }
  

  if (!/^\d{3,4}$/.test(cvv)) {
    errors.push('CVV inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}


export function detectCardBrand(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(cleanNumber)) return 'Visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'American Express';
  if (/^6/.test(cleanNumber)) return 'Discover';
  if (/^35(2[89]|[3-8][0-9])/.test(cleanNumber)) return 'JCB';
  
  return 'Desconhecida';
}


export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}


export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
}
