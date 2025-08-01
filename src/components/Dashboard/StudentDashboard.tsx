import React from 'react';
import { BookOpen, Users, FolderOpen, Calendar, CheckCircle, Clock } from 'lucide-react';
import { apiService } from '../../services/api';

export function StudentDashboard() {
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [modulesData, groupsData, projectsData] = await Promise.all([
        apiService.getModules(),
        apiService.getGroups(),
        apiService.getProjects()
      ]);

      setModules(modulesData);
      setGroups(groupsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord étudiant</h1>
        <p className="text-gray-600">Aperçu de vos modules et projets</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Mes modules</h3>
            <div className="space-y-3">
              {modules.slice(0, 3).map((module) => (
                <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{module.name}</p>
                    <p className="text-sm text-gray-600">Prof. {module.teacherFirstName} {module.teacherLastName}</p>
                  </div>
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Projets en cours</h3>
            <div className="space-y-3">
              {projects.filter(p => p.status === 'active').slice(0, 3).map((project) => (
                <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{project.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        Échéance: {new Date(project.dueDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                      Actif
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progression</span>
                      <span>{project.steps?.filter(s => s.isCompleted).length || 0}/{project.steps?.length || 0} étapes</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${project.steps?.length ? (project.steps.filter(s => s.isCompleted).length / project.steps.length) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
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
            <BookOpen className="h-6 w-6 text-purple-500 mb-2" />
            <p className="font-medium text-gray-900">Voir les modules</p>
            <p className="text-sm text-gray-600">Accéder à vos cours</p>
          </button>
        </div>
      </div>
    </div>
  );
}