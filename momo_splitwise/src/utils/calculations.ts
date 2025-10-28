export const calculateEqualSplit = (
  amount: number,
  numberOfPeople: number
): number[] => {
  const equalShare = amount / numberOfPeople;
  const shares = Array(numberOfPeople).fill(parseFloat(equalShare.toFixed(2)));

  const total = shares.reduce((sum, share) => sum + share, 0);
  if (total !== amount) {
    shares[0] = parseFloat((shares[0] + (amount - total)).toFixed(2));
  }

  return shares;
};

export const calculatePercentageSplit = (
  amount: number,
  percentages: number[]
): number[] => {
  return percentages.map((percentage) =>
    parseFloat((amount * (percentage / 100)).toFixed(2))
  );
};

export const formatCurrency = (
  amount: number,
  currency: string = "Rwf"
): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const generateColor = (index: number): string => {
  const colors = [
    "bg-linear-to-br  from-yellow-700-400 to-yellow-700-400",
    "bg-linear-to-br  from-gold-400 to-orange-400",
    "bg-linear-to-br  from-yellow-400 to-cyan-400",
    "bg-linear-to-br  from-blue-400 to-indigo-400",
    "bg-linear-to-br  from-green-400 to-emerald-400",
    "bg-linear-to-br  from-red-400 to-rose-400",
  ];
  return colors[index % colors.length];
};
