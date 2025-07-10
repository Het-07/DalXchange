import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const code = query.get("code");

    if (!code) return;

    const domain = import.meta.env.VITE_COGNITO_DOMAIN;
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code: code,
      redirect_uri: redirectUri,
    });

    fetch(`https://${domain}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("id_token", data.id_token);
          localStorage.setItem("refresh_token", data.refresh_token);
        }
        navigate("/?loggedIn=true", { replace: true });
      })
      .catch((err) => {
        console.error("Token exchange failed", err);
      });
  }, [navigate]);

  return <div>Signing you in...</div>;
}
