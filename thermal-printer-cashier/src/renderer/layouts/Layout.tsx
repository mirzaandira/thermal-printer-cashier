import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: { id: string; name: string; role: string };
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/pos', label: 'Point of Sale', icon: '🛒' },
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/inventory', label: 'Inventory', icon: '📋' },
    { path: '/reports', label: 'Sales Reports', icon: '📈' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-blue-700 to-blue-900 text-white transition-all duration-300 flex flex-col shadow-lg`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-blue-600">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-lg">Cashier</h2>
                <p className="text-xs text-blue-200">POS System</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-xl hover:bg-blue-600 p-1 rounded"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center ${
                sidebarOpen ? 'px-4 py-3' : 'justify-center p-3'
              } rounded-lg mb-2 transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-100 hover:bg-blue-600'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-blue-600">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              👤
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-blue-200 uppercase">{user.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            className={`w-full ${
              sidebarOpen ? 'px-4 py-2' : 'p-2'
            } bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors`}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              {menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleString('id-ID')}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
