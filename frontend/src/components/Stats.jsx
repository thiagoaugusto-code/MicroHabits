import { useEffect, useState } from "react";
import { api } from "../api";
import "./Css/Stats.css";

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || !user?.userId) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get(`/habits/stats/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
        setError("Erro ao buscar estatísticas");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p className="loading">Carregando estatísticas...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p>Nenhum dado disponível.</p>;

  const topStreak = stats.habits.reduce(
    (max, h) => (h.streak > max.streak ? h : max),
    stats.habits[0] || { title: "-", streak: 0 }
  );

  return (
    <div className="stats-container">
      <h1 className="stats-title">📈 Estatísticas de Hábitos</h1>

      <div className="card-grid">
        <div className="card">
          <h3>Total de Hábitos</h3>
          <p>{stats.totalHabits}</p>
        </div>

        <div className="card">
          <h3>Maior Streak 🔥</h3>
          <p>{topStreak.title} ({topStreak.streak} dias)</p>
        </div>

        <div className="card">
          <h3>Categoria Mais Frequente 🏆</h3>
          <p>{stats.topCategory || "Nenhuma"}</p>
        </div>

        <div className="card">
          <h3>Progresso Semanal</h3>
          <p>{stats.weeklyCompletions} completados</p>
        </div>

        <div className="card">
          <h3>Progresso Mensal</h3>
          <p>{stats.monthlyCompletions} completados</p>
        </div>
      </div>

      <h2 className="table-title">📋 Hábitos Detalhados</h2>

      <table className="stats-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Streak</th>
            <th>Total Completo</th>
          </tr>
        </thead>
        <tbody>
          {stats.habits.map((habit) => (
            <tr key={habit.id}>
              <td>{habit.title}</td>
              <td>{habit.category || "-"}</td>
              <td>{habit.streak}</td>
              <td>{habit.totalCompletions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
