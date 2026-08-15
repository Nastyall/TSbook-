'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile?: {
    id: number;
    avatar?: string;
    bio: string;
    phone: string;
    city: string;
    address: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string, city: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    console.log('AuthContext: загрузка из localStorage');
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    console.log('AuthContext: storedToken:', storedToken ? 'есть' : 'нет');
    console.log('AuthContext: storedUser:', storedUser ? 'есть' : 'нет');
    
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('AuthContext: пользователь загружен:', userData.username);
      } catch {
        console.log('AuthContext: ошибка парсинга user, удаляем');
        localStorage.removeItem('user');
      }
    }
    
    
    if (storedToken) {
      fetch('http://localhost:8000/api/profile/', {
        headers: { 'Authorization': `Bearer ${storedToken}` },
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && setUser) {
          console.log('AuthContext: загружен свежий профиль');
          
          const freshUser = storedUser ? { ...JSON.parse(storedUser), profile: data } : null;
          setUser(freshUser);
          if (freshUser) {
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        }
      })
      .catch(err => console.error('AuthContext: ошибка загрузки профиля:', err));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('Отправка запроса на вход...');
      console.log('URL:', 'http://localhost:8000/api/auth/login/');
      
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Статус ответа:', response.status);
      console.log('Все заголовки ответа:', Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log('Тело ответа (сырой текст):', text.substring(0, 1000));

      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('ОШИБКА: Сервер вернул не JSON. Первые 500 символов:', text.substring(0, 500));
        throw new Error('Сервер вернул некорректный ответ. Статус: ' + response.status);
      }

      if (!response.ok) {
        let errorMessage = `Ошибка входа (статус ${response.status})`;
        let errorData: unknown = null;

        try {
          errorData = text.trim() ? JSON.parse(text) : null;

          
          if (errorData && typeof errorData === 'object' && Object.keys(errorData).length > 0) {
            console.error('Ошибка входа:', errorData);
          }

          if (errorData && typeof errorData === 'object') {
            const data = errorData as Record<string, unknown>;
            if (data.detail && typeof data.detail === 'string') {
              errorMessage = data.detail;
            } else if (data.error && typeof data.error === 'string') {
              errorMessage = data.error;
            } else if (data.message && typeof data.message === 'string') {
              errorMessage = data.message;
            } else if (data.non_field_errors && Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
              errorMessage = data.non_field_errors[0] as string;
            } else if (Object.keys(data).length > 0) {
              
              const errorMessages: string[] = [];
              for (const [key, value] of Object.entries(data)) {
                if (Array.isArray(value) && value.length > 0) {
                  errorMessages.push(`${key}: ${value.join(', ')}`);
                } else if (value !== undefined && value !== null) {
                  errorMessages.push(`${key}: ${String(value)}`);
                }
              }
              if (errorMessages.length > 0) {
                errorMessage = errorMessages.join('; ');
              }
            }
          }
        } catch (parseError) {
          console.error('Ошибка входа: невалидный JSON ответ:', text.substring(0, 500));
          errorMessage = text.trim() ? text.substring(0, 200) : errorMessage;
        }

       
        if (errorMessage.includes('Ошибка входа (статус') && (response.status === 401 || response.status === 403)) {
          errorMessage = 'Неверное имя пользователя или пароль';
        }

        throw new Error(errorMessage);
      }

      const data = JSON.parse(text);
      console.log('Данные входа:', data);
      setToken(data.access);
      setUser(data.user);
      localStorage.setItem('access_token', data.access);
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error: unknown) {
      console.error('Исключение при входе:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ошибка входа');
    }
  };

  const register = async (username: string, email: string, password: string, confirmPassword: string, city: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, password_confirm: confirmPassword, city }),
      });

      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Не JSON ответ от сервера:', text.substring(0, 200));
        throw new Error('Сервер вернул некорректный ответ. Проверьте, что бэкенд запущен.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Ошибка регистрации (статус ${response.status})`;

        try {
          const errorData = errorText.trim() ? JSON.parse(errorText) : {};
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (Object.keys(errorData).length > 0) {
            errorMessage = `${errorMessage}: ${JSON.stringify(errorData)}`;
          }
        } catch {
          errorMessage = `${errorMessage}: ${errorText.substring(0, 200)}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setToken(data.access);
      setUser(data.user);
      localStorage.setItem('access_token', data.access);
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ошибка регистрации');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const refreshToken = async (): Promise<boolean> => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      console.log('AuthContext: нет refresh токена');
      return false;
    }
    try {
      const response = await fetch('http://localhost:8000/api/auth/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) {
        console.log('AuthContext: refresh токен тоже истёк');
        logout();
        return false;
      }
      const data = await response.json();
      const newAccess = data.access;
      setToken(newAccess);
      localStorage.setItem('access_token', newAccess);
      console.log('AuthContext: токен обновлён');
      return true;
    } catch {
      logout();
      return false;
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    isAuthenticated: !!token,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
