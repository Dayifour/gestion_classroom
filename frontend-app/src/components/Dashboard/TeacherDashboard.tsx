    import React, { useState, useEffect } from 'react';
    import { BookOpen, Users, FolderOpen, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
    import { apiService } from '../../services/api';

    // Interface pour un Module (doit correspondre à la structure retournée par l'API Modules)
    interface Module {
      id: string; // Ou number, selon ce que ton backend retourne
      name: string;
      description?: string;
      teacherId?: string;
      teacher?: { // Si l'API inclut les détails de l'enseignant
        id: string;
        first_name: string;
        last_name: string;
        email: string;
      };
      // Ajoute d'autres propriétés si ton API les retourne (ex: studentCount)
      studentCount?: number; // Ajouté car utilisé dans le rendu
    }

    // Interface pour une Soumission (à adapter si ton backend retourne plus/moins de champs)
    interface Submission {
      id: string; // Ou number
      title: string;
      groupName: string;
      status: 'pending' | 'approved' | 'rejected'; // Les statuts possibles
      // Ajoute d'autres propriétés si ton API les retourne
    }

    export function TeacherDashboard() {
      const [stats, setStats] = useState({
        totalModules: 0,
        totalGroups: 0,
        totalProjects: 0,
        pendingSubmissions: 0
      });
      // Spécifie le type pour useState
      const [modules, setModules] = useState<Module[]>([]);
      const [submissions, setSubmissions] = useState<Submission[]>([]);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        loadDashboardData();
      }, []);

      const loadDashboardData = async () => {
        try {
          // Spécifie les types attendus des données
          const [modulesData, projectsData, groupsData, submissionsData]: [Module[], any[], any[], Submission[]] = await Promise.all([
            apiService.getModules(),
            apiService.getProjects(), // Ces types devront aussi être définis si tu les utilises
            apiService.getGroups(),   // Ces types devront aussi être définis si tu les utilises
            apiService.getSubmissions()
          ]);

          setModules(modulesData);
          setSubmissions(submissionsData);

          setStats({
            totalModules: modulesData.length,
            totalGroups: groupsData.length,
            totalProjects: projectsData.length,
            pendingSubmissions: submissionsData.filter(s => s.status === 'pending').length
          });
        } catch (error) {
          console.error('Error loading dashboard data:', error);
          // Gérer l'affichage de l'erreur dans l'UI si nécessaire
        } finally {
          setLoading(false);
        }
      };

      const statsCards = [
        { label: 'Modules', value: stats.totalModules, icon: BookOpen, color: 'bg-blue-500' },
        { label: 'Groupes', value: stats.totalGroups, icon: Users, color: 'bg-green-500' },
        { label: 'Projets', value: stats.totalProjects, icon: FolderOpen, color: 'bg-purple-500' },
        { label: 'En attente', value: stats.pendingSubmissions, icon: Clock, color: 'bg-orange-500' }
      ];

      if (loading) {
        return (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600">Chargement du tableau de bord...</p>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord enseignant</h1>
            <p className="text-gray-600">Aperçu de vos modules et projets</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => {
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
                  {modules.slice(0, 3).map((module) => (
                    <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{module.name}</p>
                        <p className="text-sm text-gray-600">{module.studentCount || 0} étudiants</p>
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
                  {submissions.slice(0, 3).map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{submission.title}</p>
                        <p className="text-sm text-gray-600">Groupe {submission.groupName}</p>
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
    