import { useState, useEffect } from "react";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import HabitsList from "./components/HabitsList.jsx";
import "./index.css";

// leitura segura do localStorage
let initialUser = null;
const storedUser = localStorage.getItem("user");
if (storedUser) {
  try {
    initialUser = JSON.parse(storedUser);
  } catch (e) {
    console.warn("LocalStorage 'user' não é JSON válido:", e);
  }
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(initialUser); // inicializa com usuário existente
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user"); //remove dados do usuário ao deslogar
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <div>
      {user ? (
        <>
          <button onClick={handleLogout}>Logout</button>
          <HabitsList user={user} />
        </>
      ) : showRegister ? (
        <>
          <Register onRegisterSucces={() => setShowRegister(false)} />
          <p>
            Já tem uma conta?{" "}
            <button onClick={() => setShowRegister(false)}>Login</button>
          </p>
        </>
      ) : (
        <>
          <Login setUser={setUser} setToken={setToken} />
          <p>
            Não tem uma conta?{" "}
            <button onClick={() => setShowRegister(true)}>Cadastrar</button>
          </p>
        </>
      )}
    </div>
  );
}
