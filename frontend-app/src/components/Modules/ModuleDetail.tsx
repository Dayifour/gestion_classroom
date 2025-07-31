import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { BookOpen, Users, ArrowLeft, AlertTriangle, UserIcon } from 'lucide-react';

// Interface pour un module détaillé (doit correspondre à la réponse de getModule par ID)
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
  // Tu peux ajouter d'autres relations si ton backend les inclut (ex: projects, students)
  projects?: Array<{ id: string; name: string; due_date: string; }>;
  students?: Array<{ id: string; first_name: string; last_name: string; }>;
}

export function ModuleDetail() {
  const { id } = useParams<{ id: string }>(); // Récupère l'ID du module depuis l'URL
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModule = async () => {
      if (!id) {
        setError("ID du module manquant.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data: Module = await apiService.getModule(id);
        setModule(data);
      } catch (err: any) {
        console.error('Error loading module details:', err);
        setError(err.message || 'Erreur lors du chargement des détails du module.');
      } finally {
        setLoading(false);
      }
    };
    loadModule();
  }, [id]); // Recharge le module si l'ID change

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Chargement des détails du module...</p>
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
          onClick={() => navigate('/modules')} // Retourne à la liste des modules
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="text-center py-12 text-gray-600">
        <BookOpen className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Module non trouvé</h3>
        <p>Le module que vous recherchez n'existe pas ou a été supprimé.</p>
        <button
          onClick={() => navigate('/modules')}
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
          onClick={() => navigate('/modules')}
          className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour aux modules</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{module.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Informations générales</h2>
          <p className="text-gray-700 mb-4">{module.description}</p>

          <div className="space-y-2 text-gray-600">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
              <span>ID du module: {module.id}</span>
            </div>
            {module.teacher && (
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-500" />
                <span>Enseignant: {module.teacher.first_name} {module.teacher.last_name} ({module.teacher.email})</span>
              </div>
            )}
            <div className="flex items-center">
              <span>Créé le: {new Date(module.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <span>Dernière mise à jour: {new Date(module.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Section Projets associés (si ton API les inclut) */}
        {module.projects && module.projects.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Projets associés</h2>
            <ul className="space-y-2">
              {module.projects.map(project => (
                <li key={project.id} className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <p className="text-sm text-gray-600">Échéance: {new Date(project.due_date).toLocaleDateString()}</p>
                  </div>
                  {/* Optionnel: bouton pour voir les détails du projet */}
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Voir
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section Étudiants inscrits (si ton API les inclut) */}
        {module.students && module.students.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Étudiants inscrits</h2>
            <ul className="space-y-2">
              {module.students.map(student => (
                <li key={student.id} className="bg-gray-50 p-3 rounded-md flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-purple-500" />
                  <p className="font-medium text-gray-900">{student.first_name} {student.last_name}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
