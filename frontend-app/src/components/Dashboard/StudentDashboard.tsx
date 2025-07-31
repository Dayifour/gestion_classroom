import React, { useState, useEffect } from 'react'; // Assure-toi que useState et useEffect sont importés
import { BookOpen, Users, FolderOpen, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth'; // Pour accéder aux infos de l'utilisateur

// Interfaces de données (à adapter si ton backend retourne plus/moins de champs)
interface Module {
  id: string;
  name: string;
  description?: string;
  teacherId?: string;
  teacher?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Group {
  id: string;
  name: string;
  description?: string;
  // Ajoute d'autres propriétés si ton API les retourne
}

interface Project {
  id: string;
  name: string;
  description?: string;
  due_date?: string;
  status?: 'active' | 'completed' | 'pending'; // Exemple de statuts
  // Ajoute d'autres propriétés si ton API les retourne
  steps?: Array<{ id: string; title: string; completed: boolean }>; // Si les projets ont des étapes
}


export function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    }
  }, [authLoading, user]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Spécifie les types attendus des données
      const [modulesData, groupsData, projectsData]: [Module[], Group[], Project[]] = await Promise.all([
        apiService.getModules(), // Récupère tous les modules (pour l'instant, pas seulement ceux de l'étudiant)
        apiService.getGroups(),   // Récupère tous les groupes
        apiService.getProjects()  // Récupère tous les projets
      ]);

      // Filtrer les données pour l'étudiant connecté si l'API ne le fait pas directement
      // Pour les modules, il faudrait une API comme /api/users/{userId}/modules
      // Pour l'instant, on prend tous les modules/groupes/projets
      setModules(modulesData);
      setGroups(groupsData);
      setProjects(projectsData);

    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des données du tableau de bord.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Mes modules', value: modules.length, icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Mes groupes', value: groups.length, icon: Users, color: 'bg-green-500' },
    { label: 'Projets actifs', value: projects.filter(p => p.status === 'active').length, icon: FolderOpen, color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Chargement du tableau de bord étudiant...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
        <p>{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord étudiant</h1>
        <p className="text-gray-600">Bienvenue, {user?.firstName} ! Aperçu de votre progression.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Modules */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Modules récents</h3>
            <div className="space-y-3">
              {modules.slice(0, 3).map((module) => (
                <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{module.name}</p>
                    {module.teacher && (
                      <p className="text-sm text-gray-600">Enseignant: {module.teacher.first_name} {module.teacher.last_name}</p>
                    )}
                  </div>
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
              ))}
              {modules.length === 0 && <p className="text-gray-500 text-sm">Aucun module trouvé.</p>}
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Projets récents</h3>
            <div className="space-y-3">
              {projects.slice(0, 3).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <p className="text-sm text-gray-600">
                      Date d'échéance: {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {project.status === 'active' && <Clock className="h-5 w-5 text-orange-500" />}
                    {project.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {project.status === 'pending' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                  </div>
                </div>
              ))}
              {projects.length === 0 && <p className="text-gray-500 text-sm">Aucun projet trouvé.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Users className="h-6 w-6 text-blue-500 mb-2" />
            <p className="font-medium text-gray-900">Rejoindre un groupe</p>
            <p className="text-sm text-gray-600">Intégrer un groupe de projet</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <FolderOpen className="h-6 w-6 text-green-500 mb-2" />
            <p className="font-medium text-gray-900">Soumettre un livrable</p>
            <p className="text-sm text-gray-600">Déposer votre travail</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Calendar className="h-6 w-6 text-purple-500 mb-2" />
            <p className="font-medium text-gray-900">Voir mon calendrier</p>
            <p className="text-sm text-gray-600">Consulter les échéances</p>
          </button>
        </div>
      </div>
    </div>
  );
}
