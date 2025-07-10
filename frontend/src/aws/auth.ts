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

  const url = `${domain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
  window.location.href = url;
};
