import React, { useState, useEffect } from 'react';
import { Plus, FolderOpen, Calendar, Users, CheckCircle, Clock, AlertTriangle, Edit, Trash2, BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { CreateProjectModal } from './CreateProjectModal';
import { EditProjectModal } from './EditProjectModal';
import { useNavigate } from 'react-router-dom'; // <-- Importe useNavigate

// Définition de l'interface pour un projet
interface Project {
  id: string;
  name: string;
  description?: string;
  due_date?: string;
  status?: 'active' | 'completed' | 'pending';
  moduleId?: string;
  groupId?: string;
  projectManagerId?: string;
  createdAt: string;
  updatedAt: string;
  module?: { id: string; name: string };
  group?: { id: string; name: string };
  projectManager?: { id: string; first_name: string; last_name: string; email: string };
  users?: Array<{ id: string; username: string; role: string }>;
  steps?: Array<{ id: string; title: string; completed: boolean }>;
}

export function ProjectsList() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate(); // <-- Initialise useNavigate
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadProjects();
    }
  }, [authLoading, user]);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: Project[] = await apiService.getProjects();
      setProjects(data);
    } catch (err: any) {
      console.error('Error loading projects:', err);
      setError(err.message || 'Erreur lors du chargement des projets.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (projectId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
      try {
        await apiService.deleteProject(projectId);
        loadProjects();
      } catch (err: any) {
        console.error('Error deleting project:', err);
        setError(err.message || 'Erreur lors de la suppression du projet.');
      }
    }
  };

  const handleViewDetailsClick = (projectId: string) => { // <-- Nouvelle fonction pour la redirection
    navigate(`/projects/${projectId}`);
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Chargement des projets...</p>
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
          onClick={loadProjects}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'teacher' ? 'Projets Gérés' : 'Mes Projets'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'teacher'
              ? 'Gérez et suivez les projets de vos modules.'
              : 'Consultez la liste de vos projets assignés.'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:block">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous les projets</option>
              <option value="active">Projets actifs</option>
              <option value="completed">Projets terminés</option>
            </select>
          </div>
          {user?.role === 'teacher' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Créer un projet
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>

              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Échéance: {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'N/A'}</span>
              </div>

              {project.group && (
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Groupe: {project.group.name}</span>
                </div>
              )}

              {project.module && (
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Module: {project.module.name}</span>
                </div>
              )}

              {project.status && (
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  {getStatusIcon(project.status)}
                  <span className="ml-2 capitalize">{project.status === 'active' ? 'Actif' : project.status === 'completed' ? 'Terminé' : 'En attente'}</span>
                </div>
              )}

              {project.steps && project.steps.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progression</span>
                    <span>{Math.round((project.steps.filter(step => step.completed).length / project.steps.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${project.steps.length > 0 ? (project.steps.filter(step => step.completed).length / project.steps.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewDetailsClick(project.id)} // <-- Utilise la nouvelle fonction
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Voir détails
                </button>
                {user?.role === 'teacher' && (
                  <>
                    <button
                      onClick={() => handleEditClick(project)}
                      className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteClick(project.id)}
                      className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? user?.role === 'teacher'
                ? "Commencez par créer votre premier projet."
                : "Vous n'avez aucun projet assigné pour le moment."
              : "Aucun projet ne correspond à votre filtre."
            }
          </p>
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={() => {
            setShowCreateModal(false);
            loadProjects();
          }}
        />
      )}

      {showEditModal && selectedProject && (
        <EditProjectModal
          project={{
            ...selectedProject,
            moduleId: selectedProject.moduleId ?? "",
          }}
          onClose={() => setShowEditModal(false)}
          onProjectUpdated={() => {
            setShowEditModal(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
}
