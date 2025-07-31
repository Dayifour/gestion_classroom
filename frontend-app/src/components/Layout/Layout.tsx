import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header'; // Supposant que tu as un Header.tsx

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={''} onTabChange={function (tab: string): void {
              throw new Error('Function not implemented.');
          } } />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onProfileClick={function (): void {
                  throw new Error('Function not implemented.');
              } } /> {/* Inclure le Header */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet /> {/* C'est ici que les composants de route seront rendus */}
        </main>
      </div>
    </div>
  );
}
