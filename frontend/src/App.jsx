import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useState } from "react";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import HabitsList from "./components/HabitsList.jsx";
import Stats from "./components/Stats.jsx";
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
  const [user, setUser] = useState(initialUser);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <Router>
      <div className="app-container">
        {user && (
          <nav className="navbar">
            <button onClick={handleLogout}>Logout</button>
            <a href="/stats">Estatísticas</a>
            <a href="/habits">Hábitos</a>
          </nav>
        )}

        <Routes>
          {/* Página de login / registro */}
          {!user ? (
            <>
              <Route
                path="/"
                element={
                  showRegister ? (
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
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/habits" replace />} />
              <Route path="/habits" element={<HabitsList user={user} />} />
              <Route path="/stats" element={<Stats user={user} />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}
