import React, { useState } from 'react';
import { Plus, FolderOpen, Calendar, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockProjects } from '../../data/mockData';

export function ProjectsList() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredProjects = mockProjects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'draft':
        return 'Brouillon';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'teacher' ? 'Projets' : 'Mes projets'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'teacher' 
              ? 'Gérez les projets de vos modules' 
              : 'Vos projets et leur progression'
            }
          </p>
        </div>
        {user?.role === 'teacher' && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nouveau projet</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'active', label: 'En cours' },
          { key: 'completed', label: 'Terminés' }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption.key
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FolderOpen className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Échéance: {new Date(project.dueDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Module: {project.module.name}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      {getStatusIcon(project.status)}
                      <span className="ml-2">{project.steps.length} étapes</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progression</span>
                      <span>{project.steps.filter(s => s.isCompleted).length}/{project.steps.length} étapes</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${(project.steps.filter(s => s.isCompleted).length / project.steps.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                  Voir détails
                </button>
                {user?.role === 'teacher' && (
                  <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors">
                    Gérer
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? user?.role === 'teacher' 
                ? "Commencez par créer votre premier projet." 
                : "Vous n'avez aucun projet assigné pour le moment."
              : `Aucun projet ${filter === 'active' ? 'en cours' : 'terminé'}.`
            }
          </p>
        </div>
      )}
    </div>
  );
}