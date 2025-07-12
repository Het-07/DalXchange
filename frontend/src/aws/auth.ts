export const login = () => {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;

  const url = `${domain}/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  window.location.href = url;
};

export const logout = () => {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const logoutUri = import.meta.env.VITE_COGNITO_LOGOUT_URI;

  // Clear tokens from local storage
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('refresh_token');

  const url = `${domain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
  window.location.href = url;
};

export const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const refreshToken = async (): Promise<boolean> => {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
  const refresh_token = localStorage.getItem('refresh_token');

  if (!refresh_token) {
    return false;
  }

  try {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: refresh_token,
      redirect_uri: redirectUri,
    });

    const response = await fetch(`${domain}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await response.json();
    
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      if (data.id_token) {
        localStorage.setItem("id_token", data.id_token);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return false;
  }
};
