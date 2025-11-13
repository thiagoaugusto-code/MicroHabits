import { useState } from "react";
import { api } from "../api";

// Lightweight local JWT decoder to avoid import/export issues with the
// external `jwt-decode` package in some bundler configurations.
// Returns the decoded payload object or null on error.
function decodeJwt(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    // base64url -> base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    // Pad with '=' to make length a multiple of 4
    const padded = base64 + "==".slice((2 - (base64.length * 3) % 4) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
}

export default function Login({ setUser, setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });
      const { token } = res.data;

      if (!token) {
        throw new Error("Token ausente na resposta do servidor.");
      }

      localStorage.setItem("token", token);
      setToken(token);

  // decode JWT payload (local implementation)
  const decodedUser = decodeJwt(token);

      localStorage.setItem("user", JSON.stringify(decodedUser || {}));
      setUser(decodedUser);

      console.log("Login bem-sucedido:", decodedUser);
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      alert(error.response?.data?.error || "Erro ao realizar login");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Entrar</button>
    </form>
  );
}
