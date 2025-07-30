-- EduGroupManager Database Schema

CREATE DATABASE IF NOT EXISTS edugroupmanager;
USE edugroupmanager;

-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('teacher', 'student', 'coordinator') NOT NULL,
  avatar VARCHAR(255) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Modules table
CREATE TABLE modules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  teacherId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
);

-- Module students (many-to-many relationship)
CREATE TABLE module_students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  moduleId INT NOT NULL,
  studentId INT NOT NULL,
  enrolledAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (moduleId) REFERENCES modules(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (moduleId, studentId)
);

-- Projects table
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  moduleId INT NOT NULL,
  dueDate DATETIME NOT NULL,
  status ENUM('draft', 'active', 'completed') DEFAULT 'draft',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (moduleId) REFERENCES modules(id) ON DELETE CASCADE
);

-- Project steps table
CREATE TABLE project_steps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  projectId INT NOT NULL,
  stepOrder INT NOT NULL,
  isCompleted BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);

-- Groups table
CREATE TABLE groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  coordinatorId INT NOT NULL,
  moduleId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (coordinatorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (moduleId) REFERENCES modules(id) ON DELETE CASCADE
);

-- Group members (many-to-many relationship)
CREATE TABLE group_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  groupId INT NOT NULL,
  userId INT NOT NULL,
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (groupId) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_membership (groupId, userId)
);

-- Submissions table
CREATE TABLE submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  fileUrl VARCHAR(500),
  stepId INT NOT NULL,
  groupId INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (stepId) REFERENCES project_steps(id) ON DELETE CASCADE,
  FOREIGN KEY (groupId) REFERENCES groups(id) ON DELETE CASCADE
);

-- Submission comments table
CREATE TABLE submission_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content TEXT NOT NULL,
  authorId INT NOT NULL,
  submissionId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (submissionId) REFERENCES submissions(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  senderId INT NOT NULL,
  receiverId INT NOT NULL,
  content TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (firstName, lastName, email, password, role) VALUES
('Dr. Hamidou', 'KASSOGUE', 'kassogue@technolab.ml', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'teacher'),
('Aminata', 'TRAORE', 'aminata@student.technolab.ml', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'student'),
('Moussa', 'DIARRA', 'moussa@student.technolab.ml', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'coordinator'),
('Fatoumata', 'KEITA', 'fatoumata@student.technolab.ml', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'student'),
('Ibrahim', 'COULIBALY', 'ibrahim@student.technolab.ml', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'student');

-- Insert sample modules
INSERT INTO modules (name, description, teacherId) VALUES
('Génie Logiciel', 'Module de génie logiciel avec projets pratiques', 1),
('Base de Données', 'Conception et gestion de bases de données', 1);

-- Insert sample module enrollments
INSERT INTO module_students (moduleId, studentId) VALUES
(1, 2), (1, 3), (1, 4), (1, 5),
(2, 2), (2, 3);

-- Insert sample projects
INSERT INTO projects (title, description, moduleId, dueDate, status) VALUES
('Plateforme de gestion collaborative', 'EduGroupManager - Application web pour la gestion des projets tutorés', 1, '2024-06-15 23:59:59', 'active');

-- Insert sample project steps
INSERT INTO project_steps (title, description, projectId, stepOrder) VALUES
('Analyse des besoins', 'Analyser les besoins fonctionnels et non-fonctionnels', 1, 1),
('Conception UML', 'Créer les diagrammes UML (cas d\'utilisation, classes)', 1, 2),
('Développement prototype', 'Développer un prototype fonctionnel', 1, 3);

-- Insert sample groups
INSERT INTO groups (name, coordinatorId, moduleId) VALUES
('Groupe Alpha', 3, 1),
('Groupe Beta', 2, 2);

-- Insert sample group members
INSERT INTO group_members (groupId, userId) VALUES
(1, 2), (1, 3), (1, 4),
(2, 2), (2, 5);

-- Insert sample submissions
INSERT INTO submissions (title, description, stepId, groupId, status) VALUES
('Document d\'analyse des besoins', 'Analyse complète des besoins pour la plateforme EduGroupManager', 1, 1, 'approved');

-- Insert sample comments
INSERT INTO submission_comments (content, authorId, submissionId) VALUES
('Excellent travail d\'analyse. Les besoins sont bien identifiés.', 1, 1);