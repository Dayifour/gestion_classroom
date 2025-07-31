import React, { useState, useEffect } from 'react';
import { Plus, ListTodo, Search, Calendar, BookOpen, FolderOpen, User, CheckCircle, Clock, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { CreateTaskModal } from './CreateTaskModal';
import { EditTaskModal } from './EditTaskModal';
import { useNavigate } from 'react-router-dom'; // <-- Importe useNavigate

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
}

export function TasksList() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate(); // <-- Initialise useNavigate
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadTasks();
    }
  }, [authLoading, user]);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: Task[] = await apiService.getTasks();
      setTasks(data);
    } catch (err: any) {
      console.error('Error loading tasks:', err);
      setError(err.message || 'Erreur lors du chargement des tâches.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (taskId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.')) {
      try {
        await apiService.deleteTask(taskId);
        loadTasks();
      } catch (err: any) {
        console.error('Error deleting task:', err);
        setError(err.message || 'Erreur lors de la suppression de la tâche.');
      }
    }
  };

  const handleViewDetailsClick = (taskId: string) => { // <-- Nouvelle fonction pour la redirection
    navigate(`/tasks/${taskId}`);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = searchTerm === '' ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.module && task.module.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.project && task.project.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.assignedBy && `${task.assignedBy.first_name} ${task.assignedBy.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Chargement des tâches...</p>
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
          onClick={loadTasks}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isTeacherOrAdmin ? 'Tâches Gérées' : 'Mes Tâches'}
          </h1>
          <p className="text-gray-600">
            {isTeacherOrAdmin
              ? 'Gérez et suivez les tâches assignées.'
              : 'Consultez la liste de vos tâches et soumettez votre travail.'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
            <option value="overdue">En retard</option>
          </select>
          {isTeacherOrAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Créer une tâche
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{task.description || 'Aucune description.'}</p>

              <div className="space-y-2 text-gray-600 text-sm mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-red-500" />
                  <span>Échéance: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                {task.module && (
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-purple-500" />
                    <span>Module: {task.module.name}</span>
                  </div>
                )}
                {task.project && (
                  <div className="flex items-center">
                    <FolderOpen className="h-4 w-4 mr-2 text-orange-500" />
                    <span>Projet: {task.project.name}</span>
                  </div>
                )}
                {task.assignedBy && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-green-500" />
                    <span>Assigné par: {task.assignedBy.first_name} {task.assignedBy.last_name}</span>
                  </div>
                )}
                <div className="flex items-center text-base font-medium mt-2">
                  {getStatusIcon(task.status)}
                  <span className="ml-2 capitalize">Statut: {task.status.replace(/_/g, ' ')}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewDetailsClick(task.id)} // <-- Utilise la nouvelle fonction
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Voir détails
                </button>
                {isTeacherOrAdmin && (task.assignedById === user?.id) && ( // Seul l'enseignant qui a assigné peut modifier/supprimer
                  <>
                    <button
                      onClick={() => handleEditClick(task)}
                      className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteClick(task.id)}
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

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <ListTodo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche trouvée</h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Aucune tâche ne correspond à votre recherche."
              : isTeacherOrAdmin
                ? "Commencez par créer votre première tâche."
                : "Vous n'avez aucune tâche assignée pour le moment."
            }
          </p>
        </div>
      )}

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onTaskCreated={() => {
            setShowCreateModal(false);
            loadTasks();
          }}
        />
      )}

      {showEditModal && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setShowEditModal(false)}
          onTaskUpdated={() => {
            setShowEditModal(false);
            loadTasks();
          }}
        />
      )}
    </div>
  );
}
