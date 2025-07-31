import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FolderOpen,
  MessageCircle,
  Settings,
  ListTodo, // <-- Ajout de ListTodo pour les tâches
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user } = useAuth();

  // Les onglets pour les enseignants et coordinateurs
  const teacherCoordinatorTabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'modules', label: 'Mes modules', icon: BookOpen },
    { id: 'projects', label: 'Projets', icon: FolderOpen },
    { id: 'groups', label: 'Groupes', icon: Users },
    { id: 'tasks', label: 'Tâches', icon: ListTodo }, // <-- Ajout de l'onglet Tâches
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const studentTabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'modules', label: 'Mes modules', icon: BookOpen },
    { id: 'projects', label: 'Mes projets', icon: FolderOpen },
    { id: 'groups', label: 'Mes groupes', icon: Users },
    { id: 'tasks', label: 'Tâches', icon: ListTodo }, // <-- Ajout de l'onglet Tâches
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  // Détermine quel ensemble d'onglets afficher en fonction du rôle de l'utilisateur
  const tabs = user?.role === 'teacher' || user?.role === 'coordinator' ? teacherCoordinatorTabs : studentTabs;


  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        {user && (
          <div className="text-sm text-gray-400 mb-2">
            Connecté en tant que: {/* CORRIGÉ: Utilise user.firstName et user.lastName */}
            <span className="font-medium text-gray-200">{user.firstName} {user.lastName} ({user.role})</span>
          </div>
        )}
        <button
          onClick={() => {
            // TODO: Replace with your logout logic, e.g. call a logout function from useAuth
            // Example: logout();
            console.log('Déconnexion clicked');
          }}
          className="flex items-center px-4 py-2 rounded-md transition-colors duration-200 w-full text-left hover:bg-red-700 text-red-300"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
