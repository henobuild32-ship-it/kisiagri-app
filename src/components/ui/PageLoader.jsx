import React from "react";
import { Sprout } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Sprout className="w-10 h-10 text-green-600 animate-pulse" />
      <p className="text-sm text-gray-500 mt-3">Chargement...</p>
    </div>
  );
}