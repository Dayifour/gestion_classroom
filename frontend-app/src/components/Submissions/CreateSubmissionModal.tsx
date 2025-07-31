import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface CreateSubmissionModalProps {
  taskId: string;
  onClose: () => void;
  onSubmissionCreated: () => void;
}

interface Group {
  id: string;
  name: string;
}

export function CreateSubmissionModal({ taskId, onClose, onSubmissionCreated }: CreateSubmissionModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    submittedByGroupId: '', // Pour les soumissions de groupe
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadUserGroups = async () => {
      if (user?.role === 'student') {
        setDataLoading(true);
        setError('');
        try {
          // Récupère tous les groupes et filtre ceux auxquels l'utilisateur appartient
          const allGroups = await apiService.getGroups();
          const userGroupsData = allGroups.filter((group: any) =>
            group.users.some((member: any) => member.id === user.id)
          );
          setUserGroups(userGroupsData);
        } catch (err: any) {
          console.error('Error loading user groups:', err);
          setError(err.message || 'Erreur lors du chargement de vos groupes.');
        } finally {
          setDataLoading(false);
        }
      } else {
        setDataLoading(false); // Pas besoin de charger les groupes si ce n'est pas un étudiant
      }
    };
    loadUserGroups();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.createSubmission({
        title: formData.title,
        description: formData.description,
        file_url: formData.file_url || undefined,
        taskId: taskId,
        submittedByGroupId: formData.submittedByGroupId || undefined,
      });
      onSubmissionCreated();
    } catch (err: any) {
      console.error('Error creating submission:', err);
      setError(err.message || 'Erreur lors de la création de la soumission.');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = user?.role === 'student';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Upload className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-medium text-gray-900">Soumettre un travail</h2>
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
              Titre de la soumission
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="ex: Rapport du chapitre 1"
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
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Détails de votre soumission..."
            />
          </div>

          <div>
            <label htmlFor="file_url" className="block text-sm font-medium text-gray-700 mb-1">
              Lien du fichier (Google Drive, Dropbox, etc.)
            </label>
            <input
              type="url"
              id="file_url"
              value={formData.file_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="https://drive.google.com/..."
            />
          </div>

          {isStudent && userGroups.length > 0 && (
            <div>
              <label htmlFor="submittedByGroupId" className="block text-sm font-medium text-gray-700 mb-1">
                Soumettre en tant que groupe (Optionnel)
              </label>
              {dataLoading ? (
                <div className="flex items-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <p className="ml-2 text-gray-600">Chargement des groupes...</p>
                </div>
              ) : (
                <select
                  id="submittedByGroupId"
                  value={formData.submittedByGroupId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Soumettre individuellement</option>
                  {userGroups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              )}
            </div>
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
              disabled={loading || dataLoading || !formData.title || (!formData.file_url && !formData.description)}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Soumission...' : 'Soumettre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
