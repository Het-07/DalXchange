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
      .then((res) => {
        if (!res.ok) {
          console.error("Token exchange failed with status:", res.status);
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("id_token", data.id_token);
          localStorage.setItem("refresh_token", data.refresh_token);

          // Store user email for convenience
          try {
            const payload = JSON.parse(atob(data.id_token.split(".")[1]));
            if (payload.email) {
              localStorage.setItem("user_email", payload.email);
            }
          } catch (e) {
            console.warn("Could not extract email from token", e);
          }

          navigate("/?loggedIn=true", { replace: true });
        } else {
          console.error(
            "Token exchange succeeded but no access token returned:",
            data
          );
          navigate("/?error=missing_token", { replace: true });
        }
      })
      .catch((err) => {
        console.error("Token exchange failed", err);
        navigate("/?error=auth_failed", { replace: true });
      });
  }, [navigate]);

  return <div>Signing you in...</div>;
}
