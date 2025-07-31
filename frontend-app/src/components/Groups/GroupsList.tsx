import React, { useState, useEffect } from 'react';
import { Plus, Users, User, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { CreateGroupModal } from './CreateGroupModal';
import { EditGroupModal } from './EditGroupModal';
import { useNavigate } from 'react-router-dom'; // <-- Importe useNavigate

// Définition de l'interface pour un groupe
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
  }>;
  coordinatorId?: string;
}

export function GroupsList() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate(); // <-- Initialise useNavigate
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadGroups();
    }
  }, [authLoading, user]);

  const loadGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: Group[] = await apiService.getGroups();
      setGroups(data);
    } catch (err: any) {
      console.error('Error loading groups:', err);
      setError(err.message || 'Erreur lors du chargement des groupes.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (group: Group) => {
    setSelectedGroup(group);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (groupId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible.')) {
      try {
        await apiService.deleteGroup(groupId);
        loadGroups();
      } catch (err: any) {
        console.error('Error deleting group:', err);
        setError(err.message || 'Erreur lors de la suppression du groupe.');
      }
    }
  };

  const handleViewDetailsClick = (groupId: string) => { // <-- Nouvelle fonction pour la redirection
    navigate(`/groups/${groupId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Chargement des groupes...</p>
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
          onClick={loadGroups}
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
            {user?.role === 'teacher' ? 'Groupes' : 'Mes Groupes'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'teacher'
              ? 'Gérez les groupes de vos modules.'
              : 'Consultez la liste de vos groupes de projet.'}
          </p>
        </div>
        {user?.role === 'teacher' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Créer un groupe
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{group.name}</h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{group.description}</p>

              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Users className="h-4 w-4 mr-2" />
                <span>Membres: {group.users ? group.users.length : 'N/A'}</span>
              </div>

              {group.users && group.users.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium mb-1">Liste des membres:</p>
                  {group.users.slice(0, 3).map(member => (
                    <div key={member.id} className="flex items-center mb-1">
                      <User className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{member.first_name} {member.last_name}</span>
                    </div>
                  ))}
                  {group.users.length > 3 && (
                    <p className="text-xs text-gray-500 mt-1">+{group.users.length - 3} autres</p>
                  )}
                </div>
              )}

              <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => handleViewDetailsClick(group.id)} // <-- Utilise la nouvelle fonction
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Voir détails
                </button>
                {user?.role === 'teacher' && (
                  <>
                    <button
                      onClick={() => handleEditClick(group)}
                      className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteClick(group.id)}
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

      {groups.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun groupe trouvé</h3>
          <p className="text-gray-600">
            {user?.role === 'teacher'
              ? "Aucun groupe n'a été créé dans vos modules."
              : "Vous n'êtes inscrit à aucun groupe pour le moment."
            }
          </p>
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={() => {
            setShowCreateModal(false);
            loadGroups();
          }}
        />
      )}

      {showEditModal && selectedGroup && (
        <EditGroupModal
          group={selectedGroup}
          onClose={() => setShowEditModal(false)}
          onGroupUpdated={() => {
            setShowEditModal(false);
            loadGroups();
          }}
        />
      )}
    </div>
  );
}
