import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  FolderOpen,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Upload,
  Eye,
  Crown,
  MessageSquare,
  GraduationCap,
  ListTodo // Ajouté pour l'icône de tâche dans le message d'erreur
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { CreateSubmissionModal } from '../Submissions/CreateSubmissionModal';
import { SubmissionDetailModal } from '../Submissions/SubmissionDetailModal';

// Interfaces pour les données
interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  moduleId?: string;
  projectId?: string;
  assignedById: string;
  createdAt: string;
  updatedAt: string;
  module?: { id: string; name: string };
  project?: { id: string; name: string };
  assignedBy?: { id: string; first_name: string; last_name: string; email: string };
  submissions?: Submission[];
}

interface Submission {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  submitted_at: string;
  status: 'pending' | 'graded' | 'returned_for_revision';
  grade?: number;
  feedback?: string;
  taskId: string;
  submittedById?: string;
  submittedByGroupId?: string;
  submittedBy?: { id: string; first_name: string; last_name: string; email: string; role: string };
  // CORRECTION: Ajout de 'users' à l'interface submittedByGroup
  submittedByGroup?: { id: string; name: string; users?: Array<{ id: string; first_name: string; last_name: string; email: string; role: string }> };
}

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateSubmissionModal, setShowCreateSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      loadTask();
    }
  }, [id, authLoading, user]);

  const loadTask = async () => {
    if (!id) {
      setError("ID de la tâche manquant.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data: Task = await apiService.getTask(id);
      setTask(data);
    } catch (err: any) {
      console.error('Error loading task details:', err);
      setError(err.message || 'Erreur lors du chargement des détails de la tâche.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (newStatus: Task['status']) => {
    if (!task) return;
    setIsUpdatingStatus(true);
    setError(null);
    try {
      // Assurez-vous que apiService.updateTask existe et prend le bon format
      await apiService.updateTask(task.id, { status: newStatus });
      await loadTask(); // Recharger la tâche pour voir le nouveau statut
    } catch (err: any) {
      console.error('Error updating task status:', err);
      setError(err.message || 'Erreur lors de la mise à jour du statut de la tâche.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task || !window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    try {
      // Assurez-vous que apiService.deleteTask existe
      await apiService.deleteTask(task.id);
      navigate('/tasks'); // Rediriger vers la liste des tâches
    } catch (err: any) {
      console.error('Error deleting task:', err);
      setError(err.message || 'Erreur lors de la suppression de la tâche.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSubmissionStatusColor = (status: Submission['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'graded': return 'text-green-700 bg-green-100';
      case 'returned_for_revision': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Chargement des détails de la tâche...</p>
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
          onClick={() => navigate('/tasks')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12 text-gray-600">
        <ListTodo className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Tâche non trouvée</h3>
        <p>La tâche que vous recherchez n'existe pas ou a été supprimée.</p>
        <button
          onClick={() => navigate('/tasks')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';
  const isStudent = user?.role === 'student';

  // Déterminer si l'utilisateur actuel a déjà soumis pour cette tâche (individuellement ou via un groupe dont il est membre)
  const userHasSubmitted = task.submissions?.some(sub =>
    (sub.submittedById === user?.id) ||
    (sub.submittedByGroup?.users?.some(member => member.id === user?.id)) // Correction: 'member' est déjà typé via l'interface
  );

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <button
          onClick={() => navigate('/tasks')}
          className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour aux tâches</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
        {isTeacherOrAdmin && (
          <div className="flex space-x-2">
            <button
              onClick={() => { /* Implémente la modale d'édition de tâche ici */ }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Edit className="h-5 w-5 mr-2" />
              Modifier
            </button>
            <button
              onClick={handleDeleteTask}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Supprimer
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations de la tâche */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Détails de la tâche</h2>
          <p className="text-gray-700 mb-4">{task.description || 'Aucune description fournie.'}</p>

          <div className="space-y-2 text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              <span>Échéance: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</span>
            </div>
            {task.module && (
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
                <span>Module: {task.module.name}</span>
              </div>
            )}
            {task.project && (
              <div className="flex items-center">
                <FolderOpen className="h-5 w-5 mr-2 text-orange-500" />
                <span>Projet: {task.project.name}</span>
              </div>
            )}
            {task.assignedBy && (
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-green-500" />
                <span>Assigné par: {task.assignedBy.first_name} {task.assignedBy.last_name}</span>
              </div>
            )}
            <div className="flex items-center text-lg font-medium mt-4">
              {getStatusIcon(task.status)}
              <span className="ml-2 capitalize">Statut: {task.status.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Actions pour l'enseignant: Mettre à jour le statut de la tâche */}
          {isTeacherOrAdmin && (
            <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Mettre à jour le statut de la tâche</h3>
              <select
                value={task.status}
                onChange={(e) => handleUpdateTaskStatus(e.target.value as Task['status'])}
                disabled={isUpdatingStatus}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="overdue">En retard</option>
              </select>
              {isUpdatingStatus && <p className="text-sm text-blue-600 mt-2">Mise à jour du statut...</p>}
            </div>
          )}
        </div>

        {/* Section Soumissions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Soumissions</h2>
          {isStudent && !userHasSubmitted && ( // Seul l'étudiant qui n'a pas encore soumis peut soumettre
            <button
              onClick={() => setShowCreateSubmissionModal(true)}
              className="inline-flex items-center px-4 py-2 mb-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <Upload className="h-5 w-5 mr-2" />
              Soumettre mon travail
            </button>
          )}

          {task.submissions && task.submissions.length > 0 ? (
            <ul className="space-y-3">
              {task.submissions.map((submission) => (
                <li key={submission.id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{submission.title}</h3>
                    <p className="text-sm text-gray-600">
                      Soumis le: {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Par: {submission.submittedBy ? `${submission.submittedBy.first_name} ${submission.submittedBy.last_name}` : ''}
                        {submission.submittedByGroup && ` (Groupe: ${submission.submittedByGroup.name})`}
                    </p>
                    {submission.grade !== null && submission.grade !== undefined && (
                        <p className="text-sm text-blue-700 font-semibold flex items-center mt-1">
                            <GraduationCap className="h-4 w-4 mr-1" />
                            Note: {submission.grade}/20
                        </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSubmissionStatusColor(submission.status)}`}>
                      {submission.status.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Voir les détails de la soumission"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <MessageSquare className="h-10 w-10 mx-auto mb-3" />
              <p>Aucune soumission pour cette tâche pour le moment.</p>
            </div>
          )}
        </div>
      </div>

      {showCreateSubmissionModal && task && (
        <CreateSubmissionModal
          taskId={task.id}
          onClose={() => setShowCreateSubmissionModal(false)}
          onSubmissionCreated={() => {
            setShowCreateSubmissionModal(false);
            loadTask(); // Recharge la tâche pour voir la nouvelle soumission
          }}
        />
      )}

      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onSubmissionUpdated={loadTask} // Recharge la tâche après mise à jour de la soumission
        />
      )}
    </div>
  );
}
