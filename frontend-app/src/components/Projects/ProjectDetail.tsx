import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { FolderOpen, Calendar, Users, BookOpen, ArrowLeft, CheckCircle, Clock, AlertTriangle, User as UserIcon } from 'lucide-react';

// Interface pour un projet détaillé
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
  users?: Array<{ id: string; username: string; first_name: string; last_name: string; role: string }>; // Membres du projet
  steps?: Array<{ id: string; title: string; description?: string; completed: boolean }>; // Étapes du projet
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        setError("ID du projet manquant.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data: Project = await apiService.getProject(id);
        setProject(data);
      } catch (err: any) {
        console.error('Error loading project details:', err);
        setError(err.message || 'Erreur lors du chargement des détails du projet.');
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-5 w-5 mr-2 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 mr-2 text-green-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 mr-2 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Chargement des détails du projet...</p>
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
          onClick={() => navigate('/projects')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12 text-gray-600">
        <FolderOpen className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Projet non trouvé</h3>
        <p>Le projet que vous recherchez n'existe pas ou a été supprimé.</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <button
          onClick={() => navigate('/projects')}
          className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour aux projets</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Informations générales</h2>
          <p className="text-gray-700 mb-4">{project.description || 'Aucune description fournie.'}</p>

          <div className="space-y-2 text-gray-600">
            <div className="flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-blue-500" />
              <span>ID du projet: {project.id}</span>
            </div>
            {project.module && (
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
                <span>Module: {project.module.name}</span>
              </div>
            )}
            {project.group && (
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-500" />
                <span>Groupe: {project.group.name}</span>
              </div>
            )}
            {project.projectManager && (
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-orange-500" />
                <span>Manager: {project.projectManager.first_name} {project.projectManager.last_name}</span>
              </div>
            )}
            {project.due_date && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-red-500" />
                <span>Échéance: {new Date(project.due_date).toLocaleDateString()}</span>
              </div>
            )}
            {project.status && (
              <div className="flex items-center">
                {getStatusIcon(project.status)}
                <span className="capitalize">Statut: {project.status === 'active' ? 'Actif' : project.status === 'completed' ? 'Terminé' : 'En attente'}</span>
              </div>
            )}
            <div className="flex items-center">
              <span>Créé le: {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <span>Dernière mise à jour: {new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Section Membres du projet */}
        {project.users && project.users.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Membres du projet</h2>
            <ul className="space-y-2">
              {project.users.map(member => (
                <li key={member.id} className="bg-gray-50 p-3 rounded-md flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  <p className="font-medium text-gray-900">{member.first_name} {member.last_name} ({member.role})</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section Étapes du projet */}
        {project.steps && project.steps.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Étapes du projet</h2>
            <ul className="space-y-2">
              {project.steps.map(step => (
                <li key={step.id} className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{step.title}</p>
                    {step.description && <p className="text-sm text-gray-600">{step.description}</p>}
                  </div>
                  {step.completed ? (
                    <span title="Terminée">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </span>
                  ) : (
                    <span title="En cours">
                      <Clock className="h-5 w-5 text-orange-500" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
