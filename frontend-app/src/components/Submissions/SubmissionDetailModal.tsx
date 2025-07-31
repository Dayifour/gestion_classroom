import React, { useState, useEffect } from 'react';
import { X, FileText, Link, User, Users, GraduationCap, MessageSquare, Save, Edit } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface SubmissionDetailModalProps {
  submission: any; // Utilise 'any' pour l'instant, ou une interface plus détaillée si nécessaire
  onClose: () => void;
  onSubmissionUpdated: () => void; // Callback pour recharger les données après mise à jour
}

export function SubmissionDetailModal({ submission, onClose, onSubmissionUpdated }: SubmissionDetailModalProps) {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [grade, setGrade] = useState<number | ''>(submission.grade || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [status, setStatus] = useState(submission.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';
  const canEdit = isTeacherOrAdmin || (user?.id === submission.submittedById && submission.status !== 'graded');

  useEffect(() => {
    setGrade(submission.grade || '');
    setFeedback(submission.feedback || '');
    setStatus(submission.status);
    setEditMode(false); // Réinitialiser le mode édition à chaque changement de soumission
    setError('');
  }, [submission]);

  const handleUpdateSubmission = async () => {
    setLoading(true);
    setError('');
    try {
      const updateData: any = {
        status: status,
        grade: grade === '' ? null : grade, // Envoyer null si vide
        feedback: feedback,
      };

      // Si l'utilisateur est un étudiant, il ne peut modifier que le titre, la description et le file_url
      if (!isTeacherOrAdmin) {
        updateData.title = submission.title; // Garde le titre et la description actuels
        updateData.description = submission.description;
        updateData.file_url = submission.file_url;
      }

      await apiService.updateSubmission(submission.id, updateData);
      onSubmissionUpdated(); // Appelle le callback pour recharger les données de la tâche parente
      setEditMode(false);
    } catch (err: any) {
      console.error('Error updating submission:', err);
      setError(err.message || 'Erreur lors de la mise à jour de la soumission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Détails de la soumission</h2>
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

          {/* Informations de base de la soumission */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-2">Titre: {submission.title}</h3>
            <p className="text-gray-700 mb-2">{submission.description || 'Aucune description.'}</p>
            {submission.file_url && (
              <p className="flex items-center text-blue-600 hover:underline">
                <Link className="h-4 w-4 mr-2" />
                <a href={submission.file_url} target="_blank" rel="noopener noreferrer">
                  Voir le fichier soumis
                </a>
              </p>
            )}
            <p className="text-sm text-gray-600 mt-2">Soumis le: {new Date(submission.submitted_at).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600 flex items-center">
              {submission.submittedBy ? (
                <>
                  <User className="h-4 w-4 mr-1" /> Par: {submission.submittedBy.first_name} {submission.submittedBy.last_name}
                </>
              ) : submission.submittedByGroup ? (
                <>
                  <Users className="h-4 w-4 mr-1" /> Par groupe: {submission.submittedByGroup.name}
                </>
              ) : (
                'Par: N/A'
              )}
            </p>
          </div>

          {/* Section de notation et feedback (visible et modifiable par enseignant/admin) */}
          {isTeacherOrAdmin && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Évaluation</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Statut de la soumission
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">En attente</option>
                    <option value="graded">Noté</option>
                    <option value="returned_for_revision">Retourné pour révision</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                    Note (sur 20)
                  </label>
                  <input
                    type="number"
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    min="0"
                    max="20"
                    step="0.5"
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: 15.5"
                  />
                </div>
                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback
                  </label>
                  <textarea
                    id="feedback"
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Donnez votre feedback ici..."
                  />
                </div>
                <button
                  onClick={handleUpdateSubmission}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {loading ? 'Enregistrement...' : 'Enregistrer l\'évaluation'}
                </button>
              </div>
            </div>
          )}

          {/* Section de visualisation de la note et du feedback pour l'étudiant */}
          {!isTeacherOrAdmin && (submission.grade !== null || submission.feedback) && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Mon évaluation</h3>
              {submission.grade !== null && submission.grade !== undefined && (
                <p className="flex items-center text-lg font-semibold text-blue-700 mb-2">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Note: {submission.grade}/20
                </p>
              )}
              {submission.feedback && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" /> Feedback du professeur:
                  </p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
                    {submission.feedback}
                  </p>
                </div>
              )}
            </div>
          )}
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
