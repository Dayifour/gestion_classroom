import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { apiService } from '../../services/api';

interface CreateTaskModalProps {
  onClose: () => void;
  onTaskCreated: () => void;
}

interface Module {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

export function CreateTaskModal({ onClose, onTaskCreated }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    moduleId: '',
    projectId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dataLoading, setDataLoading] = useState(true); // Pour le chargement des modules/projets

  useEffect(() => {
    const loadRelatedData = async () => {
      setDataLoading(true);
      setError('');
      try {
        const [modulesData, projectsData] = await Promise.all([
          apiService.getModules(),
          apiService.getProjects(),
        ]);
        setModules(modulesData);
        setProjects(projectsData);
      } catch (err: any) {
        console.error('Error loading related data for task creation:', err);
        setError(err.message || 'Erreur lors du chargement des modules et projets.');
      } finally {
        setDataLoading(false);
      }
    };
    loadRelatedData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    // Logique pour s'assurer qu'une tâche est liée à un module OU un projet, pas les deux
    if (id === 'moduleId' && value !== '') {
      setFormData(prev => ({ ...prev, projectId: '' }));
    }
    if (id === 'projectId' && value !== '') {
      setFormData(prev => ({ ...prev, moduleId: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation côté client: s'assurer qu'un module ou un projet est sélectionné
    if (!formData.moduleId && !formData.projectId) {
      setError('Veuillez associer la tâche à un module ou à un projet.');
      setLoading(false);
      return;
    }
    if (formData.moduleId && formData.projectId) {
      setError('La tâche ne peut pas être associée à la fois à un module et à un projet.');
      setLoading(false);
      return;
    }

    try {
      await apiService.createTask({
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        moduleId: formData.moduleId || undefined, // Envoyer undefined si vide
        projectId: formData.projectId || undefined, // Envoyer undefined si vide
      });
      onTaskCreated();
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || 'Erreur lors de la création de la tâche.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Plus className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Créer une nouvelle tâche</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Erreur:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre de la tâche
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ex: Rédaction du chapitre 1"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Détails de la tâche..."
            />
          </div>

          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
              Date d'échéance
            </label>
            <input
              type="date"
              id="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {dataLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-600">Chargement des données...</p>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="moduleId" className="block text-sm font-medium text-gray-700 mb-1">
                  Associer à un Module (Optionnel)
                </label>
                <select
                  id="moduleId"
                  value={formData.moduleId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un module</option>
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>{module.name}</option>
                  ))}
                </select>
                {formData.projectId && <p className="text-xs text-orange-500 mt-1">Désélectionnez le projet pour choisir un module.</p>}
              </div>

              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                  Associer à un Projet (Optionnel)
                </label>
                <select
                  id="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un projet</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                {formData.moduleId && <p className="text-xs text-orange-500 mt-1">Désélectionnez le module pour choisir un projet.</p>}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || dataLoading || (!formData.moduleId && !formData.projectId)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
