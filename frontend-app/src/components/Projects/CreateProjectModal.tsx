import React, { useState, useEffect } from 'react';
import { X, FolderOpen } from 'lucide-react';
import { apiService } from '../../services/api';

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectCreated: () => void;
}

// Interface pour les données du formulaire de projet
interface ProjectFormData {
  name: string;
  description: string;
  due_date: string; // Format ISO string (e.g., "YYYY-MM-DDTHH:mm:ssZ")
  moduleId: string;
  groupId?: string; // Optionnel
  projectManagerId?: string; // Optionnel
}

// Interface pour les modules et groupes pour les listes déroulantes
interface SelectOption {
  id: string;
  name: string;
}

export function CreateProjectModal({ onClose, onProjectCreated }: CreateProjectModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    due_date: '',
    moduleId: '',
    groupId: '',
    projectManagerId: ''
  });
  const [modules, setModules] = useState<SelectOption[]>([]);
  const [groups, setGroups] = useState<SelectOption[]>([]);
  const [teachers, setTeachers] = useState<SelectOption[]>([]); // Pour le projectManagerId
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger les modules, groupes et enseignants pour les listes déroulantes
  useEffect(() => {
    const loadSelectOptions = async () => {
      try {
        const modulesData = await apiService.getModules();
        setModules(modulesData.map((m: any) => ({ id: m.id, name: m.name })));

        const groupsData = await apiService.getGroups();
        setGroups(groupsData.map((g: any) => ({ id: g.id, name: g.name })));

        // NOTE: apiService.getUsers() n'est pas encore implémenté côté backend pour récupérer tous les utilisateurs.
        // Pour l'instant, cette partie pourrait ne pas fonctionner ou nécessiter une route backend `/api/users`.
        // Si tu as une route pour récupérer les enseignants spécifiquement, utilise-la.
        // Sinon, cette liste sera vide ou nécessitera une implémentation backend.
        // Pour l'exemple, je vais simuler quelques enseignants ou les laisser vides.
        const usersData: any[] = await apiService.getUsers(); // Assumant que getUsers retourne tous les utilisateurs
        setTeachers(usersData.filter(u => u.role === 'teacher').map(t => ({ id: t.id, name: `${t.first_name} ${t.last_name}` })));


      } catch (err) {
        console.error('Error loading select options:', err);
        // Ne pas bloquer la modale si les options ne peuvent pas être chargées
      }
    };
    loadSelectOptions();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Nettoyer les champs vides si optionnels
      const dataToSend = {
        ...formData,
        groupId: formData.groupId || undefined, // Envoyer undefined si vide
        projectManagerId: formData.projectManagerId || undefined,
      };

      await apiService.createProject(dataToSend);
      onProjectCreated();
      onClose();
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Erreur lors de la création du projet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Créer un nouveau projet</h2>
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du projet
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ex: Application de gestion de cours"
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description détaillée du projet..."
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date d'échéance
            </label>
            <input
              type="date" // Utilise input type="date" pour faciliter la sélection
              id="dueDate"
              value={formData.due_date ? formData.due_date.split('T')[0] : ''} // Formate pour l'input date
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value ? new Date(e.target.value).toISOString() : '' })} // Convertit en ISO string
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="moduleId" className="block text-sm font-medium text-gray-700 mb-1">
              Module associé
            </label>
            <select
              id="moduleId"
              value={formData.moduleId}
              onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionner un module</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>{module.name}</option>
              ))}
            </select>
            {modules.length === 0 && <p className="text-xs text-red-500 mt-1">Aucun module disponible. Créez un module d'abord.</p>}
          </div>

          <div>
            <label htmlFor="groupId" className="block text-sm font-medium text-gray-700 mb-1">
              Groupe (Optionnel)
            </label>
            <select
              id="groupId"
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Aucun groupe</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="projectManagerId" className="block text-sm font-medium text-gray-700 mb-1">
              Manager de projet (Optionnel, Enseignant)
            </label>
            <select
              id="projectManagerId"
              value={formData.projectManagerId}
              onChange={(e) => setFormData({ ...formData, projectManagerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Aucun manager</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
            {teachers.length === 0 && <p className="text-xs text-orange-500 mt-1">Aucun enseignant trouvé pour assigner un manager.</p>}
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
              {loading ? 'Création...' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
