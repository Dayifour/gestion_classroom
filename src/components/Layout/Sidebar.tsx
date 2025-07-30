import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  FolderOpen, 
  MessageCircle,
  Settings
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user } = useAuth();

  const teacherTabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'modules', label: 'Mes modules', icon: BookOpen },
    { id: 'projects', label: 'Projets', icon: FolderOpen },
    { id: 'groups', label: 'Groupes', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const studentTabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'modules', label: 'Mes modules', icon: BookOpen },
    { id: 'projects', label: 'Mes projets', icon: FolderOpen },
    { id: 'groups', label: 'Mes groupes', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const tabs = user?.role === 'teacher' ? teacherTabs : studentTabs;

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
                <Icon className="mr-3 h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}