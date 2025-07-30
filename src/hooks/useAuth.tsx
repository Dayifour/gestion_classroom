import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Mock authentication - in real app, this would be an API call
    const mockUsers: User[] = [
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
      }
    ];

    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid credentials');
    }
    
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}