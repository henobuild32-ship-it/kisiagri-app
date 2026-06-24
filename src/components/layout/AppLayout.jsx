import React from "react";
import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNav />
      <main className="pt-14 pb-20 max-w-lg mx-auto px-4">
        <Outlet />
      </main>
      <BottomNav />
      <footer className="fixed bottom-16 left-0 right-0 pointer-events-none">
        <div className="max-w-lg mx-auto px-4 pb-1">
        </div>
      </footer>
    </div>
  );
}