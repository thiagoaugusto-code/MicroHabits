import { useState } from "react";
import {api} from "../api";

export default function Login ({setToken}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            alert('Login realizado com sucesso!');          
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao realizar login');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" name="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Entrar</button>
        </div>
    );
}