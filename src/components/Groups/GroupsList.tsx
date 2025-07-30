import React, { useState } from 'react';
import { Plus, Users, User, Calendar, BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';

export function GroupsList() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await apiService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'teacher' ? 'Groupes' : 'Mes groupes'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'teacher' 
              ? 'Gérez les groupes de travail de vos modules' 
              : 'Vos groupes de projet'
            }
          </p>
        </div>
        {user?.role !== 'teacher' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Créer un groupe</span>
          </button>
        )}
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                </div>
                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                  Actif
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>
                    Coordinateur: {group.coordinatorFirstName} {group.coordinatorLastName}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{group.members?.length || 0} membres</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Module: {group.moduleName}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Créé le {new Date(group.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              
              {/* Members List */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Membres:</p>
                <div className="space-y-1">
                  {group.members?.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">
                        {member.firstName} {member.lastName}
                        {member.id == group.coordinatorId && (
                          <span className="text-xs text-blue-600 ml-1">(Coordinateur)</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium">
                  Voir détails
                </button>
                {(user?.role === 'teacher' || user?.id == group.coordinatorId) && (
                  <button className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
                    <User className="h-4 w-4" />
                  </button>
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
              : "Vous n'appartenez à aucun groupe. Créez-en un ou demandez à rejoindre un groupe existant."
            }
          </p>
        </div>
      )}
    </div>
  );
}