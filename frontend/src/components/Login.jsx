import { useState } from "react";
import { api } from "../api";
import { jwtDecode } from "jwt-decode"; 

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

      // jwtDecode correto
      const decodedUser = jwtDecode(token);

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
