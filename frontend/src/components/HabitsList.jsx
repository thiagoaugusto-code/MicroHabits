import { useEffect, useState } from "react";
import { api } from "../api";

export default function HabitsList() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');

  // Garantir leitura segura do localStorage e tratamento do userId
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Ajuste — tenta capturar o campo correto do ID, já que pode vir como id, userId ou sub
  const userId = user?.id || user?.userId || user?.sub;

  // Debug temporário pra conferir o que vem do token
  console.log("Usuário no localStorage:", user);
  console.log("ID do usuário detectado:", userId);

  useEffect(() => {
    if (userId) fetchHabits();
  }, [userId]);

  const fetchHabits = async () => {
    try {
      const res = await api.get(`/habits?userId=${userId}`);
      setHabits(res.data);
    } catch (error) {
      console.error("Erro ao buscar hábitos:", error);
    }
  };

  const addHabit = async () => {
    if (!newHabit.trim()) {
      alert('O nome do hábito não pode ser vazio.');
      return;
    }

    
    console.log("Enviando hábito:", { name: newHabit, userId });

    try {
      await api.post('/habits', { name: newHabit, userId });
      setNewHabit('');
      fetchHabits();
    } catch (error) {
      console.error("Erro ao adicionar hábito:", error);
    }
  };

  const deleteHabit = async (habitId) => {
    try {
      await api.delete(`/habits/${habitId}`);
      fetchHabits();
    } catch (error) {
      console.error("Erro ao deletar hábito:", error);
    }
  };

  return (
    <div>
      <h2>Meus Hábitos</h2>
      <input
        type="text"
        placeholder="Novo Hábito"
        value={newHabit}
        onChange={e => setNewHabit(e.target.value)}
      />
      <button onClick={addHabit}>Adicionar Hábito</button>

      <ul>
        {habits.map(habit => (
          <li key={habit.id}>
            <span>{habit.title}</span>
            <small>Frequência: {habit.frequency || "-"}</small>
            <small>Criado em: {new Date(habit.createdAt).toLocaleDateString()}</small>
            <button onClick={() => deleteHabit(habit.id)}>Deletar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
