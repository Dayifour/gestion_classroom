const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
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

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
  }) {
    const response = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Users endpoints
  async getUsers() {
    return this.request<any[]>('/users');
  }

  async getStudents() {
    return this.request<any[]>('/users/students');
  }

  // Modules endpoints
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

  async addStudentToModule(moduleId: string, studentId: string) {
    return this.request(`/modules/${moduleId}/students`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  }

  // Projects endpoints
  async getProjects() {
    return this.request<any[]>('/projects');
  }

  async createProject(projectData: {
    title: string;
    description?: string;
    moduleId: string;
    dueDate: string;
    steps: Array<{ title: string; description?: string }>;
  }) {
    return this.request<{ projectId: number }>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async getProject(id: string) {
    return this.request<any>(`/projects/${id}`);
  }

  // Groups endpoints
  async getGroups() {
    return this.request<any[]>('/groups');
  }

  async createGroup(groupData: {
    name: string;
    moduleId: string;
    memberIds: string[];
  }) {
    return this.request<{ groupId: number }>('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async getGroup(id: string) {
    return this.request<any>(`/groups/${id}`);
  }

  // Submissions endpoints
  async getSubmissions() {
    return this.request<any[]>('/submissions');
  }

  async createSubmission(submissionData: {
    title: string;
    description?: string;
    stepId: string;
    groupId: string;
    fileUrl?: string;
  }) {
    return this.request<{ submissionId: number }>('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  }

  async updateSubmissionStatus(id: string, status: string, comment?: string) {
    return this.request(`/submissions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comment }),
    });
  }

  async getSubmissionComments(id: string) {
    return this.request<any[]>(`/submissions/${id}/comments`);
  }

  async addSubmissionComment(id: string, content: string) {
    return this.request<{ commentId: number }>(`/submissions/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Messages endpoints
  async getConversations() {
    return this.request<any[]>('/messages/conversations');
  }

  async getConversation(userId: string) {
    return this.request<any[]>(`/messages/conversation/${userId}`);
  }

  async sendMessage(receiverId: string, content: string) {
    return this.request<{ messageId: number }>('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    });
  }
}

export const apiService = new ApiService();