import React, { useState, useEffect } from 'react';
import { Plus, Users, BookOpen, Calendar, Search, CheckCircle, Clock, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { CreateModuleModal } from './CreateModuleModal';
import { EditModuleModal } from './EditModuleModal';
import { useNavigate } from 'react-router-dom'; // <-- Importe useNavigate

// Définition de l'interface pour un module
interface Module {
  id: string;
  name: string;
  description: string;
  teacherId?: string;
  teacher?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  studentCount?: number;
}

export function ModulesList() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate(); // <-- Initialise useNavigate
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadModules();
    }
  }, [authLoading, user]);

  const loadModules = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: Module[] = await apiService.getModules();
      setModules(data);
    } catch (err: any) {
      console.error('Error loading modules:', err);
      setError(err.message || 'Erreur lors du chargement des modules.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (module: Module) => {
    setSelectedModule(module);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (moduleId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible.')) {
      try {
        await apiService.deleteModule(moduleId);
        loadModules();
      } catch (err: any) {
        console.error('Error deleting module:', err);
        setError(err.message || 'Erreur lors de la suppression du module.');
      }
    }
  };

  const handleViewDetailsClick = (moduleId: string) => { // <-- Nouvelle fonction pour la redirection
    navigate(`/modules/${moduleId}`);
  };

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (module.teacher && `${module.teacher.first_name} ${module.teacher.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Chargement des modules...</p>
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
          onClick={loadModules}
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
            {user?.role === 'teacher' ? 'Mes Modules' : 'Modules Disponibles'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'teacher'
              ? 'Gérez les modules que vous enseignez.'
              : 'Parcourez les modules disponibles et inscrivez-vous.'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {user?.role === 'teacher' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Créer un module
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <div key={module.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{module.name}</h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{module.description}</p>

              <div className="flex items-center text-sm text-gray-500 mb-2">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Module de cours</span>
              </div>

              {module.teacher && (
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Enseignant: {module.teacher.first_name} {module.teacher.last_name}</span>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                {user?.role === 'teacher' && module.teacherId === user.id ? ( // Seul l'enseignant propriétaire peut modifier/supprimer
                  <>
                    <button
                      onClick={() => handleEditClick(module)}
                      className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteClick(module.id)}
                      className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                    </button>
                  </>
                ) : ( // Pour les étudiants ou enseignants non propriétaires
                  <button
                    onClick={() => handleViewDetailsClick(module.id)} // <-- Utilise la nouvelle fonction
                    className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-100 transition-colors font-medium"
                  >
                    Voir le module
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun module trouvé</h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Aucun module ne correspond à votre recherche."
              : user?.role === 'teacher'
                ? "Commencez par créer votre premier module."
                : "Vous n'êtes inscrit à aucun module pour le moment."
            }
          </p>
        </div>
      )}

      {showCreateModal && (
        <CreateModuleModal
          onClose={() => setShowCreateModal(false)}
          onModuleCreated={() => {
            setShowCreateModal(false);
            loadModules();
          }}
        />
      )}

      {showEditModal && selectedModule && (
        <EditModuleModal
          module={selectedModule}
          onClose={() => setShowEditModal(false)}
          onModuleUpdated={() => {
            setShowEditModal(false);
            loadModules();
          }}
        />
      )}
    </div>
  );
}
