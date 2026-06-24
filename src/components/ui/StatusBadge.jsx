import React from "react";
import { t } from "@/lib/i18n";

const statusStyles = {
  en_attente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  partielle: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  payee: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  en_retard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  soumis: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  verifie: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejete: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  brouillon: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  en_signature: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  signe: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  annule: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  pending: "bg-yellow-100 text-yellow-800",
  success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  confirmed: "bg-green-100 text-green-800",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
      {t(status) || status}
    </span>
  );
}