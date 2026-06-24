import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, Check, CheckCheck } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatDateTime } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";

const typeIcons = {
  dette: "💰", paiement: "✅", prix: "📊", stock: "📦", contrat: "📄", signature: "✍️", systeme: "🔔"
};

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifs(); }, []);

  async function loadNotifs() {
    try {
      const data = await base44.entities.Notification.list("-created_date", 50);
      setNotifs(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function markRead(id) {
    try {
      await base44.entities.Notification.update(id, { is_read: true });
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) { console.error(e); }
  }

  async function markAllRead() {
    try {
      const unread = notifs.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) { console.error(e); }
  }

  const unreadCount = notifs.filter(n => !n.is_read).length;

  if (loading) return <PageLoader />;

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t("notifications")}</h1>
          {unreadCount > 0 && <p className="text-xs text-gray-500">{unreadCount} non lue(s)</p>}
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={markAllRead}>
            <CheckCheck className="w-3 h-3 mr-1" /> Tout lire
          </Button>
        )}
      </div>

      {notifs.length === 0 ? (
        <EmptyState icon={Bell} title="Aucune notification" description="Vos notifications apparaîtront ici" />
      ) : (
        <div className="space-y-2">
          {notifs.map(notif => (
            <div
              key={notif.id}
              onClick={() => !notif.is_read && markRead(notif.id)}
              className={`bg-white dark:bg-gray-900 rounded-2xl p-4 border transition-colors cursor-pointer ${
                notif.is_read
                  ? "border-gray-100 dark:border-gray-800"
                  : "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{typeIcons[notif.type] || "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{notif.title}</h3>
                    {!notif.is_read && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(notif.created_date)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}