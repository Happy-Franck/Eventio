'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/lib/types';

interface DashboardLayoutProps {
  children: ReactNode;
  user: User;
  role: 'admin' | 'client' | 'provider';
}

export default function DashboardLayout({ children, user, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
          { name: 'Types de Prestation', href: '/admin/prestation-types', icon: '🎯' },
          { name: 'Catégories', href: '/admin/categories', icon: '📁' },
          { name: 'Clients', href: '/admin/clients', icon: '👥' },
          { name: 'Prestataires', href: '/admin/providers', icon: '🏢' },
        ];
      case 'client':
        return [
          { name: 'Dashboard', href: '/client/dashboard', icon: '📊' },
          { name: 'Prestataires', href: '/client/providers', icon: '🔍' },
          { name: 'Mes Teams', href: '/client/teams', icon: '🛒' },
          { name: 'Mes Budgets', href: '/client/budgets', icon: '💰' },
          { name: 'Collections', href: '/client/collections', icon: '⭐' },
          { name: 'Comparer', href: '/client/compare', icon: '⚖️' },
        ];
      case 'provider':
        return [
          { name: 'Dashboard', href: '/provider/dashboard', icon: '📊' },
          { name: 'Mon Profil', href: '/provider/profile', icon: '👤' },
          { name: 'Mes Services', href: '/provider/services', icon: '🎨' },
          { name: 'Demandes', href: '/provider/requests', icon: '📬' },
          { name: 'Statistiques', href: '/provider/stats', icon: '📈' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200 w-64`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo */}
          <div className="mb-6 px-3">
            <h1 className="text-2xl font-bold text-blue-600">Eventio</h1>
            <p className="text-sm text-gray-500 capitalize">{role}</p>
          </div>

          {/* Menu Items */}
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700'
                  }`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* User Info & Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenue, {user.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
