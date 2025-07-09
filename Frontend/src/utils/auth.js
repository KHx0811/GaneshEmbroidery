export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ganesh-embroidery.onrender.com';

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp && payload.exp < currentTime) {
      setAuthToken(null);
      return false;
    }
    
    return true;
  } catch (error) {
    setAuthToken(null);
    return false;
  }
};

export const logout = async () => {
  try {
    const token = getAuthToken();
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    setAuthToken(null);
    window.location.href = '/login';
  }
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
};

export const getUserData = () => {
  const token = getAuthToken();
  if (!token || !isAuthenticated()) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      username: payload.username || payload.user || 'User',
      email: payload.email || '',
      role: payload.role || 'user',
      id: payload.id || payload.userId || null
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getUserRole = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || 'user';
  } catch (error) {
    console.error('Error decoding token for role:', error);
    return null;
  }
};

export const getUserInfo = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      username: payload.username || payload.user || 'User',
      email: payload.email || '',
      role: payload.role || 'user'
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
