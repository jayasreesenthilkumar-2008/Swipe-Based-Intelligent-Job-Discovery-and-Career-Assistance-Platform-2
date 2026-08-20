import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Notification, NotificationType } from '@/lib/types';
import { timeAgo } from '@/lib/utils';
import {
  Bell,
  Heart,
  Zap,
  Building2,
  Mail,
  Calendar,
  Check,
  Inbox,
} from 'lucide-react';

const typeIcons: Record<NotificationType, typeof Bell> = {
  info: Bell,
  match: Heart,
  competition: Zap,
  startup: Building2,
  application: Mail,
  interview: Calendar,
};

const typeColors: Record<NotificationType, string> = {
  info: 'bg-slate-100 text-slate-600',
  match: 'bg-rose-100 text-rose-600',
  competition: 'bg-amber-100 text-amber-600',
  startup: 'bg-blue-100 text-blue-600',
  application: 'bg-violet-100 text-violet-600',
  interview: 'bg-emerald-100 text-emerald-600',
};

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile?.id || '')
        .order('created_at', { ascending: false });

      setNotifications((data as Notification[]) || []);
      setLoading(false);
    }
    load();
  }, [profile?.id]);

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', profile?.id || '')
      .eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="w-8 h-8 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 text-sm">
            No notifications yet. We'll let you know about new matches and
            opportunities!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type];
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`rounded-2xl border p-4 flex items-start gap-3 cursor-pointer transition-all ${
                  n.read
                    ? 'bg-white border-slate-200'
                    : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColors[n.type]}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {timeAgo(n.created_at)}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
