import { useState } from "react";
import {api} from "../api";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', { email, password });
            alert('Usuário registrado com sucesso!');
            console.log(res.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Erro ao registrar usuário');
        }   
    };
    return (
        <div>
            <h2>Cadastrar</h2>
            <form onSubmit={handleRegister}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />

                <input type="password" name="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />

                <button onClick={handleRegister}>Cadastrar</button>
            </form>
        </div>
    );
}   