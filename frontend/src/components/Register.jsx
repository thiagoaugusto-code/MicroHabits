import { useState } from "react";
import { api } from "../api";

export default function Register({ onRegisterSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { email, password });
      alert('Usuário registrado com sucesso!');
      onRegisterSuccess?.(); // chama callback para voltar ao login
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao registrar usuário');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Cadastrar</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Cadastrar</button>
    </form>
  );
}
