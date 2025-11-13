import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import HabitsList from "./components/HabitsList.jsx";
import Stats from "./components/Stats.jsx";
import "./components/Css/index.css";

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
        {user ? (
          <>
            {/* 🔹 Navbar */}
            <nav className="navbar">
              <div className="nav-left">
                <strong>Habit Tracker</strong>
              </div>
              <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/stats">Estatísticas</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </nav>

            {/* 🔹 Rotas */}
            <Routes>
              <Route path="/" element={<HabitsList user={user} />} />
              <Route path="/stats" element={<Stats user={user} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
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
    </Router>
  );
}
