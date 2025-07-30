import React, { useState } from 'react';
import { Plus, Users, BookOpen, Calendar, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockModules } from '../../data/mockData';
import { CreateModuleModal } from './CreateModuleModal';

export function ModulesList() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModules = mockModules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'teacher' ? 'Mes modules' : 'Modules'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'teacher' 
              ? 'Gérez vos modules et suivez les projets' 
              : 'Vos modules et projets en cours'
            }
          </p>
        </div>
        {user?.role === 'teacher' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau module</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un module..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <div key={module.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{module.description}</p>
                </div>
                <BookOpen className="h-6 w-6 text-blue-500 ml-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{module.students.length} étudiants inscrits</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Créé le {new Date(module.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                
                {user?.role === 'teacher' && (
                  <div className="text-sm text-gray-500">
                    <span>Enseignant: {module.teacher.firstName} {module.teacher.lastName}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-100 transition-colors font-medium">
                  Voir le module
                </button>
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
        <CreateModuleModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}