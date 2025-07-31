import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, UserMinus, Crown, Check } from 'lucide-react';
import { apiService } from '../../services/api';

// Interface pour les données de l'utilisateur (membre potentiel ou coordinateur)
interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email?: string; // <-- MODIFIÉ : Rendu optionnel
  role: string;
}

interface ManageGroupMembersModalProps {
  groupId: string;
  currentMembers: UserData[];
  currentCoordinatorId: string | null;
  onClose: () => void;
  onMembersUpdated: () => void;
}

export function ManageGroupMembersModal({
  groupId,
  currentMembers,
  currentCoordinatorId,
  onClose,
  onMembersUpdated,
}: ManageGroupMembersModalProps) {
  const [allStudents, setAllStudents] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCoordinator, setSelectedCoordinator] = useState<string | null>(currentCoordinatorId);
  const [isUpdatingCoordinator, setIsUpdatingCoordinator] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      setError('');
      try {
        const users = await apiService.getUsers();
        setAllStudents(users.filter((user: any) => user.role === 'student'));
      } catch (err: any) {
        console.error('Error loading students:', err);
        setError(err.message || 'Erreur lors du chargement des étudiants.');
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, []);

  const handleToggleMembership = async (userId: string, isMember: boolean) => {
    setError('');
    try {
      if (isMember) {
        await apiService.manageGroupMembership(groupId, userId, 'remove');
        if (selectedCoordinator === userId) {
          setSelectedCoordinator(null);
        }
      } else {
        await apiService.manageGroupMembership(groupId, userId, 'add');
      }
      onMembersUpdated();
    } catch (err: any) {
      console.error('Error managing membership:', err);
      setError(err.message || 'Erreur lors de la gestion de l\'adhésion.');
    }
  };

  const handleCoordinatorChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCoordinatorId = e.target.value === '' ? null : e.target.value;
    setSelectedCoordinator(newCoordinatorId);
    setIsUpdatingCoordinator(true);
    setError('');

    try {
      await apiService.updateGroup(groupId, { coordinatorId: newCoordinatorId });
      onMembersUpdated();
    } catch (err: any) {
      console.error('Error updating coordinator:', err);
      setError(err.message || 'Erreur lors de la mise à jour du coordinateur.');
    } finally {
      setIsUpdatingCoordinator(false);
    }
  };

  const isStudentInGroup = (studentId: string) =>
    currentMembers.some(member => member.id === studentId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Gérer les membres du groupe</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Erreur:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {/* Section du coordinateur */}
          <div>
            <label htmlFor="coordinator" className="block text-sm font-medium text-gray-700 mb-2">
              Désigner un coordinateur (doit être un membre du groupe)
            </label>
            <div className="relative">
              <select
                id="coordinator"
                value={selectedCoordinator || ''}
                onChange={handleCoordinatorChange}
                disabled={isUpdatingCoordinator || currentMembers.filter(m => m.role === 'student').length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-10"
              >
                <option value="">Aucun coordinateur</option>
                {currentMembers
                  .filter(member => member.role === 'student')
                  .map(member => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name} ({member.email})
                    </option>
                  ))}
              </select>
              {isUpdatingCoordinator && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
              {currentMembers.filter(m => m.role === 'student').length === 0 && (
                <p className="text-xs text-orange-500 mt-1">Ajoutez des étudiants au groupe pour désigner un coordinateur.</p>
              )}
            </div>
          </div>

          {/* Section de gestion des membres */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-3">Ajouter ou retirer des membres</h3>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-600">Chargement des étudiants...</p>
              </div>
            ) : allStudents.length === 0 ? (
              <p className="text-gray-600">Aucun étudiant disponible dans le système.</p>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                {allStudents.map((student) => {
                  const isMember = isStudentInGroup(student.id);
                  return (
                    <li key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        {isMember ? <Check className="h-4 w-4 text-green-500 mr-2" /> : <UserPlus className="h-4 w-4 text-gray-400 mr-2" />}
                        <span>{student.first_name} {student.last_name} ({student.email})</span>
                      </div>
                      <button
                        onClick={() => handleToggleMembership(student.id, isMember)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          isMember
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {isMember ? 'Retirer' : 'Ajouter'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
