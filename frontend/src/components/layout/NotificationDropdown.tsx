import React, { useEffect, useState } from 'react';
import { notificationService, type AppNotification } from '@/services/notification';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const [res, countRes] = await Promise.all([
        notificationService.getNotifications(1, 10),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(res.items || []);
      setUnreadCount(countRes.unread_count || 0);
    } catch {
      // ignore
    }
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark all read');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-8 h-8 rounded-full border-none text-slate-700 hover:text-[#0065eb] hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white border border-slate-200 shadow-none rounded-xl p-2">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
          <span className="font-semibold text-sm text-slate-800">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="text-[11px] font-normal text-blue-600 hover:underline flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-1">
          {notifications.length === 0 ? (
            <div className="p-4 text-xs text-slate-400 text-center">No notifications</div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={`p-3 text-xs flex flex-col items-start gap-1 cursor-pointer hover:bg-slate-50 ${
                  !n.is_read ? 'bg-blue-50/40 font-medium' : ''
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-slate-800">{n.title}</span>
                  {!n.is_read && (
                    <button onClick={(e) => handleMarkRead(n.id, e)} className="text-blue-600 hover:text-blue-800">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-slate-600 font-normal leading-snug">{n.message}</p>
                <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleTimeString()}</span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
