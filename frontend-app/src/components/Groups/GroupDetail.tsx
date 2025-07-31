import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Users, User as UserIcon, ArrowLeft, AlertTriangle, Crown, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ManageGroupMembersModal } from './ManageGroupMembersModal';

// Interface pour un groupe détaillé
interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  users?: Array<{
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
    email?: string; // Ajouté ici pour correspondre à UserData si nécessaire, bien que GroupDetail ne l'utilise pas directement pour les membres
  }>;
  coordinatorId?: string | null;
  coordinator?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  projects?: Array<{ id: string; name: string; due_date: string; }>;
  modules?: Array<{ id: string; name: string; teacher?: { first_name: string; last_name: string; }; }>;
}

export function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);

  useEffect(() => {
    loadGroup();
  }, [id]);

  const loadGroup = async () => {
    if (!id) {
      setError("ID du groupe manquant.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data: Group = await apiService.getGroup(id);
      setGroup(data);
    } catch (err: any) {
      console.error('Error loading group details:', err);
      setError(err.message || 'Erreur lors du chargement des détails du groupe.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Chargement des détails du groupe...</p>
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
          onClick={() => navigate('/groups')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12 text-gray-600">
        <Users className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Groupe non trouvé</h3>
        <p>Le groupe que vous recherchez n'existe pas ou a été supprimé.</p>
        <button
          onClick={() => navigate('/groups')}
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
          onClick={() => navigate('/groups')}
          className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour aux groupes</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
        {user?.role === 'teacher' && (
          <button
            onClick={() => setShowManageMembersModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Settings className="h-5 w-5 mr-2" />
            Gérer les membres
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Informations générales</h2>
          <p className="text-gray-700 mb-4">{group.description || 'Aucune description fournie.'}</p>

          <div className="space-y-2 text-gray-600">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              <span>ID du groupe: {group.id}</span>
            </div>
            {group.coordinator && (
              <div className="flex items-center text-green-700 font-medium">
                <Crown className="h-5 w-5 mr-2 text-yellow-500" /> {/* <-- MODIFIÉ ici */}
                <span>Coordinateur: {group.coordinator.first_name} {group.coordinator.last_name}</span>
              </div>
            )}
            <div className="flex items-center">
              <span>Créé le: {new Date(group.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <span>Dernière mise à jour: {new Date(group.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Section Membres du groupe */}
        {group.users && group.users.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Membres du groupe ({group.users.length})</h2>
            <ul className="space-y-2">
              {group.users.map(member => (
                <li key={member.id} className="bg-gray-50 p-3 rounded-md flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  <p className="font-medium text-gray-900">{member.first_name} {member.last_name} ({member.role})</p>
                  {group.coordinatorId === member.id && (
                    <><Crown className="h-4 w-4 ml-2 text-yellow-500" /><span className="sr-only">Coordinateur</span></>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section Projets associés (si ton API les inclut) */}
        {group.projects && group.projects.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Projets associés</h2>
            <ul className="space-y-2">
              {group.projects.map(project => (
                <li key={project.id} className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <p className="text-sm text-gray-600">Échéance: {new Date(project.due_date).toLocaleDateString()}</p>
                  </div>
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

        {/* Section Modules associés (si ton API les inclut) */}
        {group.modules && group.modules.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Modules associés</h2>
            <ul className="space-y-2">
              {group.modules.map(module => (
                <li key={module.id} className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{module.name}</p>
                    {module.teacher && <p className="text-sm text-gray-600">Enseignant: {module.teacher.first_name} {module.teacher.last_name}</p>}
                  </div>
                  <button
                    onClick={() => navigate(`/modules/${module.id}`)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Voir
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showManageMembersModal && group.users && (
        <ManageGroupMembersModal
          groupId={group.id}
          currentMembers={group.users}
          currentCoordinatorId={group.coordinatorId || null}
          onClose={() => setShowManageMembersModal(false)}
          onMembersUpdated={loadGroup}
        />
      )}
    </div>
  );
}
