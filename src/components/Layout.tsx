import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useAppStore } from '../store';
import { api } from '../api';
import { Bell, LayoutDashboard, ListTodo, LogOut, Settings, Activity, Menu, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { headerInfo, setHeaderInfo } = useAppStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      api.getHeaderInfo().then(res => setHeaderInfo(res.value)).catch(console.error);
      if (user.role === 'manager') {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
      }
    }
  }, [user, navigate]);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReadNotification = async (id: number) => {
    try {
      await api.readNotification(id);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: ListTodo, label: 'Nhiệm vụ' },
    ...(user.role === 'manager' ? [
      { path: '/logs', icon: Activity, label: 'Lịch sử hệ thống' },
      { path: '/settings', icon: Settings, label: 'Cấu hình' },
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-emerald-950 text-white transition-transform duration-300 ease-in-out flex flex-col shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )} style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">PROJECT BA NA HILLS 4 LAND</h1>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left",
                  isActive ? "bg-emerald-800 text-white font-medium shadow-sm" : "text-emerald-200 hover:bg-emerald-800/50 hover:text-white"
                )}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-900">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-lg shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-emerald-300 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full mt-2 flex items-center space-x-3 px-4 py-2 rounded-lg text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center space-x-4">
            <button className="md:hidden text-slate-500" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Người tổng hợp</h2>
              {user.role === 'manager' ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={headerInfo}
                    onChange={(e) => setHeaderInfo(e.target.value)}
                    onBlur={() => api.updateHeaderInfo(headerInfo)}
                    className="text-lg font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              ) : (
                <p className="text-lg font-bold text-slate-900">{headerInfo}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user.role === 'manager' && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-semibold text-slate-800">Thông báo</h3>
                      <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        {unreadCount} mới
                      </span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          Không có thông báo nào
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {notifications.map(n => (
                            <div 
                              key={n.id} 
                              className={cn(
                                "p-4 transition-colors hover:bg-slate-50 cursor-pointer",
                                !n.isRead ? "bg-emerald-50/50" : ""
                              )}
                              onClick={() => handleReadNotification(n.id)}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-medium text-emerald-600">{n.actor}</span>
                                <span className="text-xs text-slate-400">{new Date(n.timestamp).toLocaleString('vi-VN')}</span>
                              </div>
                              <p className={cn("text-sm", !n.isRead ? "text-slate-900 font-medium" : "text-slate-600")}>
                                {n.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
