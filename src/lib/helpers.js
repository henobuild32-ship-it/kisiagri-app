export function formatCurrency(amount, currency = "CDF") {
  if (!amount && amount !== 0) return "—";
  const formatted = new Intl.NumberFormat("fr-CD", { maximumFractionDigits: 2 }).format(amount);
  return `${formatted} ${currency}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

export function generateReference() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let ref = "KA-";
  for (let i = 0; i < 8; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

export function getDebtStatusColor(status) {
  const colors = {
    en_attente: "bg-yellow-100 text-yellow-800",
    partielle: "bg-blue-100 text-blue-800",
    payee: "bg-green-100 text-green-800",
    en_retard: "bg-red-100 text-red-800"
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getDebtProgress(debt) {
  if (!debt.amount) return 0;
  return Math.min(100, Math.round(((debt.amount_paid || 0) / debt.amount) * 100));
}

export function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}