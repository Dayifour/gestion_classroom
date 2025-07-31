
const API_BASE_URL = typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'x-auth-token': this.token }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur réseau ou réponse non-JSON' }));
        throw new Error(errorData.message || `Erreur HTTP! statut: ${response.status}`);
      }

      if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('Échec de la requête API:', error);
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // --- Auth endpoints ---
  async login(identifier: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async register(userData: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
  }) {
    const response = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        first_name: userData.firstName,
        last_name: userData.lastName,
      }),
    });
    this.setToken(response.token);
    return response;
  }

  // --- Users endpoints ---
  async getUsers() {
    // Cette route n'est pas implémentée dans le backend actuel.
    // Si tu en as besoin, il faudra l'ajouter côté Node.js.
    console.warn("apiService.getUsers() appelé. La route backend correspondante n'existe pas encore.");
    return [];
  }

  async getStudents() {
    console.warn("apiService.getStudents() appelé. La route backend correspondante n'existe pas encore.");
    return [];
  }

  // --- Modules endpoints ---
  async getModules() {
    return this.request<any[]>('/modules');
  }

  async createModule(moduleData: { name: string; description?: string }) {
    return this.request<{ module: any }>('/modules', {
      method: 'POST',
      body: JSON.stringify(moduleData),
    });
  }

  async getModule(id: string) {
    return this.request<any>(`/modules/${id}`);
  }

  async updateModule(id: string, moduleData: { name?: string; description?: string }) {
    return this.request<{ message: string; module: any }>(`/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(moduleData),
    });
  }

  async deleteModule(id: string) {
    return this.request<{ message: string }>(`/modules/${id}`, {
      method: 'DELETE',
    });
  }

  // Correction des avertissements: Si la route n'est pas utilisée, il est préférable de la retirer
  // ou de la marquer comme obsolète si elle n'est pas implémentée côté backend.
  // Pour l'instant, nous la laissons mais sans les paramètres non lus.
  async addStudentToModule(moduleId: string, studentId: string) {
    console.warn(`apiService.addStudentToModule() appelé avec moduleId: ${moduleId}, studentId: ${studentId}. La route backend correspondante n'existe pas encore.`);
    return {};
  }

  // --- Projects endpoints ---
  async getProjects() {
    return this.request<any[]>('/projects');
  }

  async createProject(projectData: {
    name: string;
    description?: string;
    moduleId: string;
    due_date: string;
    groupId?: string;
    projectManagerId?: string;
  }) {
    return this.request<{ project: any }>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async getProject(id: string) {
    return this.request<any>(`/projects/${id}`);
  }

  async updateProject(id: string, projectData: {
    name?: string;
    description?: string;
    due_date?: string;
    moduleId?: string;
    groupId?: string;
    projectManagerId?: string;
  }) {
    return this.request<{ message: string; project: any }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string) {
    return this.request<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Groups endpoints ---
  async getGroups() {
    return this.request<any[]>('/groups');
  }

  async createGroup(groupData: {
    name: string;
    description?: string;
  }) {
    return this.request<{ group: any }>('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async getGroup(id: string) {
    return this.request<any>(`/groups/${id}`);
  }

  async updateGroup(id: string, groupData: { name?: string; description?: string }) {
    return this.request<{ message: string; group: any }>(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(groupData),
    });
  }

  async deleteGroup(id: string) {
    return this.request<{ message: string }>(`/groups/${id}`, {
      method: 'DELETE',
    });
  }

  async manageGroupMembership(groupId: string, userId: string, action: 'add' | 'remove') {
    return this.request(`/groups/${groupId}/membership`, {
      method: 'POST',
      body: JSON.stringify({ userId, action }),
    });
  }

  async getGroupMembers(groupId: string) {
    return this.request<any[]>(`/groups/${groupId}/members`);
  }

  // --- Tasks endpoints ---
  async getTasks() {
    return this.request<any[]>('/tasks');
  }

  async getTask(id: string) {
    return this.request<any>(`/tasks/${id}`);
  }

  async createTask(taskData: {
    title: string;
    description?: string;
    due_date?: string;
    moduleId?: string;
    projectId?: string;
    assignedById?: string;
  }) {
    return this.request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: string, taskData: {
    title?: string;
    description?: string;
    due_date?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
    moduleId?: string;
    projectId?: string;
    assignedById?: string;
  }) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id: string) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Submissions endpoints ---
  async getSubmissions(taskId?: string) {
    const endpoint = taskId ? `/submissions?taskId=${taskId}` : '/submissions';
    return this.request<any[]>(endpoint);
  }

  async createSubmission(submissionData: {
    title: string;
    description?: string;
    file_url?: string;
    taskId: string;
    submittedByGroupId?: string;
  }) {
    return this.request<any>('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  }

  async getSubmission(id: string) {
    return this.request<any>(`/submissions/${id}`);
  }

  async updateSubmission(id: string, submissionData: {
    title?: string;
    description?: string;
    file_url?: string;
    status?: 'pending' | 'graded' | 'returned_for_revision';
    grade?: number | null;
    feedback?: string;
  }) {
    return this.request<any>(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(submissionData),
    });
  }

  async deleteSubmission(id: string) {
    return this.request<any>(`/submissions/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Messages endpoints ---
  async getReceivedMessages() {
    return this.request<any[]>('/messages/received');
  }

  async getSentMessages() {
    return this.request<any[]>('/messages/sent');
  }

  async markMessageAsRead(messageId: string) {
    return this.request(`/messages/${messageId}/read`, {
      method: 'PUT',
      body: JSON.stringify({ is_read: true }),
    });
  }

  async getConversation(otherUserId: string) {
    return this.request<any[]>(`/messages/conversation/${otherUserId}`);
  }

  async sendMessage(recipientId: string, content: string) {
    return this.request<{ message: any }>('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content }),
    });
  }
}

export const apiService = new ApiService();
