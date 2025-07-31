import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { StudentDashboard } from './components/Dashboard/StudentDashboard';
import { TeacherDashboard } from './components/Dashboard/TeacherDashboard';
import { ModulesList } from './components/Modules/ModulesList';
import { ModuleDetail } from './components/Modules/ModuleDetail';
import { ProjectsList } from './components/Projects/ProjectsList';
import { ProjectDetail } from './components/Projects/ProjectDetail';
import { GroupsList } from './components/Groups/GroupsList';
import { GroupDetail } from './components/Groups/GroupDetail';
import { MessagesList } from './components/Messages/MessagesList';
import { TasksList } from './components/Tasks/TasksList'; // <-- Importe TasksList
import { TaskDetail } from './components/Tasks/TaskDetail'; // <-- Importe TaskDetail

const AuthenticatedLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Chargement de l'authentification...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Détermine le contenu principal en fonction de l'onglet actif et du rôle
  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return user.role === 'teacher' || user.role === 'coordinator' ? <TeacherDashboard /> : <StudentDashboard />;
      case 'modules':
        return <ModulesList />;
      case 'projects':
        return <ProjectsList />;
      case 'groups':
        return <GroupsList />;
      case 'messages':
        return <MessagesList />;
      case 'tasks': // <-- Ajout du cas pour l'onglet 'tasks'
        return <TasksList />;
      case 'settings':
        return (
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Paramètres du profil</h2>
            <p>Nom: {user.firstName} {user.lastName}</p>
            <p>Email: {user.email}</p>
            <p>Rôle: {user.role}</p>
          </div>
        );
      default:
        return null; // Ou une page 404
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onProfileClick={() => setActiveTab('settings')} />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
          {/* Les routes spécifiques aux détails seront rendues ici par React Router */}
          {/* Si children est présent, cela signifie que nous sommes sur une route de détail */}
          {/* Sinon, nous rendons le contenu principal basé sur l'onglet actif */}
          <Routes>
            <Route path="/" element={renderMainContent()} /> {/* Route par défaut pour le contenu des onglets */}
            <Route path="/modules/:id" element={<ModuleDetail />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/tasks/:id" element={<TaskDetail />} /> {/* <-- Nouvelle route pour TaskDetail */}
            {/* Ajoute d'autres routes de détail si nécessaire */}
            <Route path="*" element={renderMainContent()} /> {/* Fallback pour les routes non-spécifiques */}
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/*" element={<AuthenticatedLayout />} /> {/* Utilise /* pour englober toutes les routes sous AuthenticatedLayout */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
