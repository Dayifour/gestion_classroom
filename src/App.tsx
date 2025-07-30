import React, { useState } from 'react';
import { useAuth, AuthProvider } from './hooks/useAuth.tsx';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { TeacherDashboard } from './components/Dashboard/TeacherDashboard';
import { StudentDashboard } from './components/Dashboard/StudentDashboard';
import { ModulesList } from './components/Modules/ModulesList';
import { ProjectsList } from './components/Projects/ProjectsList';
import { GroupsList } from './components/Groups/GroupsList';
import { MessagesList } from './components/Messages/MessagesList';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return user.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
      case 'modules':
        return <ModulesList />;
      case 'projects':
        return <ProjectsList />;
      case 'groups':
        return <GroupsList />;
      case 'messages':
        return <MessagesList />;
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Paramètres</h2>
            <p className="text-gray-600">Cette section sera disponible prochainement.</p>
          </div>
        );
      default:
        return user.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onProfileClick={() => setShowProfile(!showProfile)} />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;