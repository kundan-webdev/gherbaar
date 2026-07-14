import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../features/notifications/notificationsApi.js';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const containerRef = useRef(null);

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 20000,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => listNotifications({ limit: 10 }),
    enabled: open,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const markReadMutation = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });
  const markAllReadMutation = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate });

  function handleItemClick(notification) {
    if (!notification.read) markReadMutation.mutate(notification._id);
    setOpen(false);
    if (notification.link) navigate(notification.link);
  }

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button
        className="btn secondary"
        onClick={() => setOpen((o) => !o)}
        style={{ position: 'relative', padding: '8px 10px' }}
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: 'var(--color-danger)',
              color: '#fff',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              minWidth: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div
            className="card"
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: 'min(340px, calc(100vw - 40px))',
              maxHeight: 420,
              overflowY: 'auto',
              zIndex: 11,
              padding: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <strong style={{ fontSize: 14 }}>Notifications</strong>
              {notifications?.items.length > 0 && (
                <button
                  className="btn secondary"
                  style={{ padding: '3px 10px', fontSize: 12 }}
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                >
                  Mark all read
                </button>
              )}
            </div>
            {!notifications && <p className="muted" style={{ fontSize: 13 }}>Loading…</p>}
            {notifications?.items.length === 0 && (
              <p className="muted" style={{ fontSize: 13 }}>
                No notifications yet.
              </p>
            )}
            <div style={{ display: 'grid', gap: 6 }}>
              {notifications?.items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleItemClick(n)}
                  style={{
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: n.read ? 'transparent' : 'var(--color-accent-soft)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{n.title}</div>
                  {n.message && (
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {n.message}
                    </div>
                  )}
                  <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                    {new Date(n.createdAt).toLocaleString('en-IN')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
