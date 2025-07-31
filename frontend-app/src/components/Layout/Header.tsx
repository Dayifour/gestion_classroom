import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, UserCircle } from 'lucide-react';

// Définition des props pour Header
interface HeaderProps {
  onProfileClick: () => void; // Fonction pour gérer le clic sur le profil
}

export function Header({ onProfileClick }: HeaderProps) { // <-- MODIFIÉ ici
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
      <div className="text-xl font-semibold text-gray-800">
        Bienvenue sur Classroom App
      </div>
      <div className="flex items-center space-x-4">
        {user && (
          <button
            onClick={onProfileClick} // <-- Ajout du onClick
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <UserCircle className="h-6 w-6" />
            <span>{user.firstName} {user.lastName} ({user.role})</span>
          </button>
        )}
        <button
          onClick={logout}
          className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </button>
      </div>
    </header>
  );
}
