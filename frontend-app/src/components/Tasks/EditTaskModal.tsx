import React, { useState, useEffect } from 'react';
import { X, ListTodo } from 'lucide-react';
import { apiService } from '../../services/api';

// Interface pour les données de la tâche à éditer
interface TaskToEdit {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  moduleId?: string;
  projectId?: string;
  assignedById: string;
}

interface EditTaskModalProps {
  task: TaskToEdit; // La tâche à éditer, passée en prop
  onClose: () => void;
  onTaskUpdated: () => void; // Callback après une mise à jour réussie
}

// Interface pour les options des listes déroulantes (Modules, Projets, Utilisateurs)
interface SelectOption {
  id: string;
  name: string;
}

export function EditTaskModal({ task, onClose, onTaskUpdated }: EditTaskModalProps) {
  const [formData, setFormData] = useState<TaskToEdit>({
    id: task.id,
    title: task.title,
    description: task.description || '',
    due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '', // Format pour input type="date"
    status: task.status,
    moduleId: task.moduleId || '',
    projectId: task.projectId || '',
    assignedById: task.assignedById,
  });
  const [modules, setModules] = useState<SelectOption[]>([]);
  const [projects, setProjects] = useState<SelectOption[]>([]);
  const [teachersAndAdmins, setTeachersAndAdmins] = useState<SelectOption[]>([]); // Pour assignedBy
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger les options pour les listes déroulantes
  useEffect(() => {
    const loadSelectOptions = async () => {
      try {
        const modulesData = await apiService.getModules();
        setModules(modulesData.map((m: any) => ({ id: m.id, name: m.name })));

        const projectsData = await apiService.getProjects();
        setProjects(projectsData.map((p: any) => ({ id: p.id, name: p.name })));

        // NOTE: apiService.getUsers() n'est pas encore implémenté côté backend pour récupérer tous les utilisateurs.
        // Si tu as une route pour récupérer les enseignants/admins spécifiquement, utilise-la.
        // Sinon, cette liste sera vide ou nécessitera une implémentation backend.
        const usersData: any[] = await apiService.getUsers(); // Assumant que getUsers retourne tous les utilisateurs
        setTeachersAndAdmins(usersData.filter(u => u.role === 'teacher' || u.role === 'admin').map(u => ({ id: u.id, name: `${u.first_name} ${u.last_name}` })));

      } catch (err) {
        console.error('Error loading select options for task edit:', err);
        // Ne pas bloquer la modale si les options ne peuvent pas être chargées
      }
    };
    loadSelectOptions();
  }, []);

  // Met à jour le formulaire si la prop 'task' change
  useEffect(() => {
    setFormData({
      id: task.id,
      title: task.title,
      description: task.description || '',
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      status: task.status,
      moduleId: task.moduleId || '',
      projectId: task.projectId || '',
      assignedById: task.assignedById,
    });
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSend = {
        ...formData,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined, // Convertir en ISO string, ou undefined si vide
        moduleId: formData.moduleId || undefined,
        projectId: formData.projectId || undefined,
        assignedById: formData.assignedById || undefined, // S'assurer que assignedById est toujours défini ou undefined
      };

      await apiService.updateTask(formData.id, dataToSend);
      onTaskUpdated();
      onClose();
    } catch (err: any) {
      console.error('Error updating task:', err);
      setError(err.message || 'Erreur lors de la mise à jour de la tâche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ListTodo className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Modifier la tâche</h2>
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ex: Rédiger le rapport du chapitre 1"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optionnel)
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Détails de la tâche..."
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date d'échéance (Optionnel)
            </label>
            <input
              type="date"
              id="dueDate"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskToEdit['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="overdue">En retard</option>
            </select>
          </div>

          <div>
            <label htmlFor="moduleId" className="block text-sm font-medium text-gray-700 mb-1">
              Module associé (Optionnel)
            </label>
            <select
              id="moduleId"
              value={formData.moduleId}
              onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Aucun module</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>{module.name}</option>
              ))}
            </select>
            {modules.length === 0 && <p className="text-xs text-orange-500 mt-1">Aucun module disponible.</p>}
          </div>

          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
              Projet associé (Optionnel)
            </label>
            <select
              id="projectId"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Aucun projet</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            {projects.length === 0 && <p className="text-xs text-orange-500 mt-1">Aucun projet disponible.</p>}
          </div>

          <div>
            <label htmlFor="assignedById" className="block text-sm font-medium text-gray-700 mb-1">
              Assigné par (Enseignant/Admin)
            </label>
            <select
              id="assignedById"
              value={formData.assignedById}
              onChange={(e) => setFormData({ ...formData, assignedById: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionner un assigneur</option>
              {teachersAndAdmins.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            {teachersAndAdmins.length === 0 && <p className="text-xs text-red-500 mt-1">Aucun enseignant ou admin disponible pour assigner la tâche.</p>}
          </div>

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
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour la tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
