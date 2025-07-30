import React from 'react';
import { BookOpen, Users, FolderOpen, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { mockModules, mockGroups, mockProjects, mockSubmissions } from '../../data/mockData';

export function TeacherDashboard() {
  const totalModules = mockModules.length;
  const totalGroups = mockGroups.length;
  const totalProjects = mockProjects.length;
  const pendingSubmissions = mockSubmissions.filter(s => s.status === 'pending').length;

  const stats = [
    { label: 'Modules', value: totalModules, icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Groupes', value: totalGroups, icon: Users, color: 'bg-green-500' },
    { label: 'Projets', value: totalProjects, icon: FolderOpen, color: 'bg-purple-500' },
    { label: 'En attente', value: pendingSubmissions, icon: Clock, color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord enseignant</h1>
        <p className="text-gray-600">Aperçu de vos modules et projets</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Modules récents</h3>
            <div className="space-y-3">
              {mockModules.map((module) => (
                <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{module.name}</p>
                    <p className="text-sm text-gray-600">{module.students.length} étudiants</p>
                  </div>
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Soumissions récentes</h3>
            <div className="space-y-3">
              {mockSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{submission.title}</p>
                    <p className="text-sm text-gray-600">Groupe {submission.group.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {submission.status === 'approved' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {submission.status === 'pending' && (
                      <Clock className="h-5 w-5 text-orange-500" />
                    )}
                    {submission.status === 'rejected' && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}