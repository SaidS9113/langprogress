'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import SidebarContent from '@/app/components/SidebarContent';
import InactivityDetector from '@/app/components/InactivityDetector';

export default function ChapitreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Vérifier aussi le localStorage pour compatibilité
  useEffect(() => {
    try {
      const shouldAutoOpen = localStorage.getItem('autoOpenCourseSidebar');
      if (shouldAutoOpen === 'true') {
        setSidebarOpen(true);
        localStorage.removeItem('autoOpenCourseSidebar');
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900">
      <InactivityDetector />
      <aside className="hidden lg:block w-80 flex-shrink-0 border-r border-gray-800">
        <div className="h-screen sticky top-0 overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
        
        <aside
          className={`absolute left-0 top-0 h-full w-80 bg-gray-900 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <SidebarContent />
        </aside>
      </div>

      <main className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-40 bg-gray-900 border-b border-gray-800 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
