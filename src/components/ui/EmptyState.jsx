import React from "react";
import { Inbox } from "lucide-react";
import { t } from "@/lib/i18n";

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">{title || t("no_data")}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}