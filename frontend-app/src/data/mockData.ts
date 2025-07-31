import { Module, Project, Group, Submission, ProjectStep, User } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Dr. Hamidou',
    lastName: 'KASSOGUE',
    email: 'kassogue@technolab.ml',
    role: 'teacher',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    firstName: 'Aminata',
    lastName: 'TRAORE',
    email: 'aminata@student.technolab.ml',
    role: 'student',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    firstName: 'Moussa',
    lastName: 'DIARRA',
    email: 'moussa@student.technolab.ml',
    role: 'coordinator',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    firstName: 'Fatoumata',
    lastName: 'KEITA',
    email: 'fatoumata@student.technolab.ml',
    role: 'student',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    firstName: 'Ibrahim',
    lastName: 'COULIBALY',
    email: 'ibrahim@student.technolab.ml',
    role: 'student',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const mockModules: Module[] = [
  {
    id: '1',
    name: 'Génie Logiciel',
    description: 'Module de génie logiciel avec projets pratiques',
    teacherId: '1',
    teacher: mockUsers[0],
    students: [mockUsers[1], mockUsers[2], mockUsers[3], mockUsers[4]],
    projects: [],
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Base de Données',
    description: 'Conception et gestion de bases de données',
    teacherId: '1',
    teacher: mockUsers[0],
    students: [mockUsers[1], mockUsers[2]],
    projects: [],
    createdAt: '2024-01-20T00:00:00Z'
  }
];

export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Groupe Alpha',
    coordinatorId: '3',
    coordinator: mockUsers[2],
    members: [mockUsers[1], mockUsers[2], mockUsers[3]],
    moduleId: '1',
    module: mockModules[0],
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Groupe Beta',
    coordinatorId: '2',
    coordinator: mockUsers[1],
    members: [mockUsers[1], mockUsers[4]],
    moduleId: '2',
    module: mockModules[1],
    createdAt: '2024-02-05T00:00:00Z'
  }
];

export const mockSteps: ProjectStep[] = [
  {
    id: '1',
    title: 'Analyse des besoins',
    description: 'Analyser les besoins fonctionnels et non-fonctionnels',
    projectId: '1',
    order: 1,
    isCompleted: true,
    submissions: []
  },
  {
    id: '2',
    title: 'Conception UML',
    description: 'Créer les diagrammes UML (cas d\'utilisation, classes)',
    projectId: '1',
    order: 2,
    isCompleted: false,
    submissions: []
  },
  {
    id: '3',
    title: 'Développement prototype',
    description: 'Développer un prototype fonctionnel',
    projectId: '1',
    order: 3,
    isCompleted: false,
    submissions: []
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Plateforme de gestion collaborative',
    description: 'EduGroupManager - Application web pour la gestion des projets tutorés',
    moduleId: '1',
    module: mockModules[0],
    dueDate: '2024-06-15T23:59:59Z',
    status: 'active',
    steps: mockSteps,
    createdAt: '2024-02-10T00:00:00Z'
  }
];

export const mockSubmissions: Submission[] = [
  {
    id: '1',
    title: 'Document d\'analyse des besoins',
    description: 'Analyse complète des besoins pour la plateforme EduGroupManager',
    stepId: '1',
    groupId: '1',
    group: mockGroups[0],
    status: 'approved',
    comments: [
      {
        id: '1',
        content: 'Excellent travail d\'analyse. Les besoins sont bien identifiés.',
        authorId: '1',
        author: mockUsers[0],
        submissionId: '1',
        createdAt: '2024-02-20T10:30:00Z'
      }
    ],
    submittedAt: '2024-02-18T14:30:00Z'
  }
];