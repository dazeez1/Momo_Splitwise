export const generateMomoPaymentLink = (phoneNumber: string, amount: number, reason: string): string => {
  const encodedReason = encodeURIComponent(reason);
  return `momo://pay?phone=${phoneNumber}&amount=${amount}&reason=${encodedReason}`;
};

export const simulateMomoPayment = async (): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return Math.random() > 0.1;
};