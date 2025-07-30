export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'teacher' | 'student' | 'coordinator';
  avatar?: string;
  createdAt: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  teacher: User;
  students: User[];
  projects: Project[];
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  coordinatorId: string;
  coordinator: User;
  members: User[];
  moduleId: string;
  module: Module;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  module: Module;
  dueDate: string;
  status: 'draft' | 'active' | 'completed';
  steps: ProjectStep[];
  createdAt: string;
}

export interface ProjectStep {
  id: string;
  title: string;
  description: string;
  projectId: string;
  order: number;
  isCompleted: boolean;
  submissions: Submission[];
}

export interface Submission {
  id: string;
  title: string;
  description: string;
  fileUrl?: string;
  stepId: string;
  groupId: string;
  group: Group;
  status: 'pending' | 'approved' | 'rejected';
  comments: Comment[];
  submittedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  submissionId: string;
  createdAt: string;
}