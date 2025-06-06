import React from 'react';
import { Header } from './header';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-6 bg-gray-100">
        {children}
      </main>
    </div>
  );
}
